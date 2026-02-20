import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async getCart(userId: string): Promise<CartDocument> {
        let cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) })
            .populate('items.product', 'title slug images price');

        if (!cart) {
            cart = new this.cartModel({ user: new Types.ObjectId(userId), items: [] });
            await cart.save();
        }

        return cart;
    }

    async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartDocument> {
        const { productId, quantity, selectedColor, selectedSize } = addToCartDto;

        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.stock < quantity) {
            throw new BadRequestException('Insufficient stock available');
        }

        let cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
        if (!cart) {
            cart = new this.cartModel({ user: new Types.ObjectId(userId), items: [] });
        }

        // Check if item already exists in cart with same variations
        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: new Types.ObjectId(productId),
                quantity,
                price: product.price, // Store current price
                selectedColor,
                selectedSize,
            } as any);
        }

        this.calculateTotalPrice(cart);
        return cart.save();
    }

    async updateQuantity(userId: string, updateDto: UpdateCartItemDto): Promise<CartDocument> {
        const { productId, quantity } = updateDto;

        const cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1) {
            throw new NotFoundException('Product not found in cart');
        }

        const product = await this.productModel.findById(productId);
        if (product && product.stock < quantity) {
            throw new BadRequestException('Insufficient stock available');
        }

        cart.items[itemIndex].quantity = quantity;
        this.calculateTotalPrice(cart);
        return cart.save();
    }

    async removeItem(userId: string, productId: string): Promise<CartDocument> {
        const cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
        this.calculateTotalPrice(cart);
        return cart.save();
    }

    async clearCart(userId: string): Promise<void> {
        await this.cartModel.findOneAndUpdate(
            { user: new Types.ObjectId(userId) },
            { items: [], totalPrice: 0 }
        );
    }

    private calculateTotalPrice(cart: CartDocument): void {
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }
}
