import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async getAdminStats() {
        // 1. Total Counts
        const [totalOrders, totalProducts, totalUsers] = await Promise.all([
            this.orderModel.countDocuments(),
            this.productModel.countDocuments(),
            this.userModel.countDocuments({ role: 'user' }),
        ]);

        // 2. Revenue Calculation (Sum of delivered orders)
        const revenueData = await this.orderModel.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // 3. Low Stock Alerts (Stock < 10)
        const lowStockProducts = await this.productModel
            .find({ stock: { $lt: 10 } })
            .select('title stock images')
            .limit(10);

        // 4. Recent Orders
        const recentOrders = await this.orderModel
            .find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // 5. Sales by Category (Optional bonus)
        const salesByCategory = await this.orderModel.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            // Note: Category names would need another lookup if we wanted titles here
        ]);

        return {
            overview: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalOrders,
                totalProducts,
                totalUsers,
            },
            lowStockProducts,
            recentOrders,
            salesByCategory
        };
    }
}
