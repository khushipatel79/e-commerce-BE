import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    async submitReview(userId: string, createReviewDto: CreateReviewDto): Promise<ReviewDocument> {
        const { productId, rating, comment, images } = createReviewDto;

        // 1. Verify Product exists
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // 2. 🛡️ Purchase Verification: Only users who bought and received the product can review
        const deliveredOrder = await this.orderModel.findOne({
            user: new Types.ObjectId(userId),
            orderStatus: 'Delivered',
            'items.product': new Types.ObjectId(productId),
        });

        if (!deliveredOrder) {
            throw new BadRequestException('You can only review products that have been delivered to you.');
        }

        // 3. One User per Product check (handled by DB unique index, but good to check here for nice error)
        const existingReview = await this.reviewModel.findOne({
            user: new Types.ObjectId(userId),
            product: new Types.ObjectId(productId),
        });

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this product.');
        }

        const review = new this.reviewModel({
            user: new Types.ObjectId(userId),
            product: new Types.ObjectId(productId),
            rating,
            comment,
            images: images || [],
        });

        return review.save();
    }

    async getProductReviews(productId: string): Promise<ReviewDocument[]> {
        return this.reviewModel
            .find({ product: new Types.ObjectId(productId), isApproved: true })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
    }

    // 👮 Admin Methods
    async getAllPendingReviews(): Promise<ReviewDocument[]> {
        return this.reviewModel
            .find({ isApproved: false })
            .populate('user', 'name email')
            .populate('product', 'title')
            .sort({ createdAt: 1 });
    }

    async updateReviewStatus(reviewId: string, updateDto: UpdateReviewStatusDto): Promise<ReviewDocument> {
        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        const wasAlreadyApproved = review.isApproved;
        review.isApproved = updateDto.isApproved;
        const savedReview = await review.save();

        // 📈 If newly approved or unapproved, update the product aggregates
        if (wasAlreadyApproved !== updateDto.isApproved) {
            await this.updateProductRating(review.product.toString());
        }

        return savedReview;
    }

    /**
     * 🧮 Auto-calculate Average Rating and Review Count for a Product
     */
    async updateProductRating(productId: string): Promise<void> {
        const stats = await this.reviewModel.aggregate([
            { $match: { product: new Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: '$product',
                    count: { $sum: 1 },
                    average: { $avg: '$rating' },
                },
            },
        ]);

        if (stats.length > 0) {
            await this.productModel.findByIdAndUpdate(productId, {
                ratingsCount: stats[0].count,
                ratingsAverage: Math.round(stats[0].average * 10) / 10, // Round to 1 decimal place
            });
        } else {
            // Reset if no approved reviews left
            await this.productModel.findByIdAndUpdate(productId, {
                ratingsCount: 0,
                ratingsAverage: 0,
            });
        }
    }

    async deleteReview(reviewId: string, userId: string, isAdmin: boolean): Promise<void> {
        const review = await this.reviewModel.findById(reviewId);
        if (!review) throw new NotFoundException('Review not found');

        // Only owner or admin can delete
        if (review.user.toString() !== userId && !isAdmin) {
            throw new BadRequestException('You are not authorized to delete this review.');
        }

        const productId = review.product.toString();
        const wasApproved = review.isApproved;

        await this.reviewModel.findByIdAndDelete(reviewId);

        if (wasApproved) {
            await this.updateProductRating(productId);
        }
    }
}
