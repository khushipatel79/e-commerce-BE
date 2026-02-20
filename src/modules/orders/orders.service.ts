import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        // 🛒 1. Fetch User Cart
        const cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Your cart is empty');
        }

        // 🏠 2. Resolve Shipping Address
        let shippingAddress = createOrderDto.shippingAddress;
        if (!shippingAddress) {
            // Use user profile address if available
            const primaryAddress = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
            if (!primaryAddress) {
                throw new BadRequestException('Shipping address is required. Please provide it in the checkout or update your profile.');
            }
            shippingAddress = {
                street: primaryAddress.street,
                city: primaryAddress.city,
                state: primaryAddress.state,
                zip: primaryAddress.zip,
                phone: primaryAddress.phone || (user as any).phone || '', // Fallback for phone
            };
        }

        // 📦 3. Validate Stock and Prepare Order Items
        const orderItems: OrderItem[] = [];
        for (const item of cart.items) {
            const product = item.product as unknown as ProductDocument;
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for product: ${product.title}`);
            }

            orderItems.push({
                product: product._id,
                title: product.title,
                quantity: item.quantity,
                price: item.price, // Use price from cart snapshot
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
            });
        }

        // 📝 4. Create the Order
        const order = new this.orderModel({
            user: new Types.ObjectId(userId),
            items: orderItems,
            shippingAddress,
            paymentMethod: createOrderDto.paymentMethod,
            totalPrice: cart.totalPrice,
            shippingPrice: 0,
        });

        const savedOrder = await order.save();

        // 📉 5. Deduct Stock from Products
        for (const item of cart.items) {
            await this.productModel.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity },
            });
        }

        // 🧹 6. Clear User Cart
        await this.cartModel.findByIdAndUpdate(cart._id, { items: [], totalPrice: 0 });

        return savedOrder;
    }

    async getUserOrders(userId: string): Promise<OrderDocument[]> {
        return this.orderModel.find({ user: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    }

    async getOrderById(orderId: string, userId: string): Promise<OrderDocument> {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('Invalid Order ID');
        }

        const order = await this.orderModel.findById(orderId).populate('items.product', 'images slug');
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Check ownership (admins can see all via getAllOrders, this is for direct ID lookup)
        const userRole = await this.getUserRole(userId);
        if (order.user.toString() !== userId && userRole !== 'admin') {
            throw new BadRequestException('You are not authorized to view this order');
        }

        return order;
    }

    private async getUserRole(userId: string): Promise<string> {
        const user = await this.userModel.findById(userId);
        return user?.role || 'user';
    }

    // 👮 Admin Methods
    async getAllOrders(): Promise<OrderDocument[]> {
        return this.orderModel.find().populate('user', 'name email').sort({ createdAt: -1 });
    }

    async updateOrderStatus(orderId: string, updateDto: UpdateOrderStatusDto): Promise<OrderDocument> {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new BadRequestException('Invalid Order ID');
        }

        const order = await this.orderModel.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // 💡 Logic: If status is being changed to 'Cancelled', we MUST recover the stock
        if (updateDto.status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
            for (const item of order.items) {
                await this.productModel.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        order.orderStatus = updateDto.status;

        // If order is delivered, we could mark payment as paid if it was COD
        if (updateDto.status === 'Delivered' && order.paymentMethod === 'COD') {
            order.paymentStatus = 'Paid';
        }

        return order.save();
    }

    async cancelOrder(orderId: string, userId: string): Promise<OrderDocument> {
        console.log(`📡 Cancellation request for: ${orderId} by user: ${userId}`);

        let order: OrderDocument | null;

        // 💡 Support both MongoDB ID and Order Number (e.g., ORD-2024-1234)
        if (Types.ObjectId.isValid(orderId)) {
            order = await this.orderModel.findById(orderId);
        } else {
            console.log(`🔎 Searching by Order Number: ${orderId}`);
            order = await this.orderModel.findOne({ orderNumber: orderId });
        }

        if (!order) {
            console.error(`❌ Order not found: ${orderId}`);
            throw new NotFoundException('Order not found. TIP: Use the MongoDB ID or the Order Number (ORD-XXXX).');
        }

        console.log(`📦 Order found. Status: ${order.orderStatus}. Owner: ${order.user}`);

        // Check authorozation (Owner or Admin)
        const user = await this.userModel.findById(userId);
        const isAdmin = user?.role === 'admin';
        const isOwner = order.user.toString() === userId;

        if (!isOwner && !isAdmin) {
            console.error(`🚫 Unauthorized: User ${userId} tried to cancel Order ${order._id}`);
            throw new BadRequestException('You are not authorized to cancel this order');
        }

        // 💡 Fix: If it's already cancelled, just return success immediately
        if (order.orderStatus === 'Cancelled') {
            console.log(`ℹ️ Order ${orderId} is already cancelled. Returning success.`);
            return order;
        }

        // Restriction: Only 'Pending' orders can be cancelled by customers
        if (order.orderStatus !== 'Pending' && !isAdmin) {
            console.error(`⚠️ Non-admin tried to cancel order in "${order.orderStatus}" status`);
            throw new BadRequestException(`Your order is already being "${order.orderStatus}". Please contact support to cancel.`);
        }

        // 🔄 Revert inventory stock
        console.log(`🔄 Reverting stock for ${order.items.length} items...`);
        for (const item of order.items) {
            await this.productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        order.orderStatus = 'Cancelled';
        console.log(`✅ Order ${order.orderNumber} (ID: ${order._id}) cancelled successfully.`);
        return order.save();
    }
}
