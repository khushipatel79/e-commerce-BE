import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class WishlistService {
    constructor(
        @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async getWishlist(userId: string): Promise<WishlistDocument> {
        let wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) })
            .populate('products', 'title slug images price');

        if (!wishlist) {
            wishlist = new this.wishlistModel({ user: new Types.ObjectId(userId), products: [] });
            await wishlist.save();
        }

        return wishlist;
    }

    async toggleWishlist(userId: string, productId: string): Promise<{ message: string }> {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        let wishlist = await this.wishlistModel.findOne({ user: new Types.ObjectId(userId) });
        if (!wishlist) {
            wishlist = new this.wishlistModel({ user: new Types.ObjectId(userId), products: [] });
        }

        const productIndex = wishlist.products.findIndex(p => p.toString() === productId);

        if (productIndex > -1) {
            // Remove if exists
            wishlist.products.splice(productIndex, 1);
            await wishlist.save();
            return { message: 'Product removed from wishlist' };
        } else {
            // Add if not exists
            wishlist.products.push(new Types.ObjectId(productId));
            await wishlist.save();
            return { message: 'Product added to wishlist' };
        }
    }

    async clearWishlist(userId: string): Promise<void> {
        await this.wishlistModel.findOneAndUpdate(
            { user: new Types.ObjectId(userId) },
            { products: [] }
        );
    }
}
