import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ required: true })
    comment: string;

    @Prop({ default: false })
    isApproved: boolean;

    @Prop({ type: [String], default: [] })
    images: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Composite unique index to ensure one user per product review
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
