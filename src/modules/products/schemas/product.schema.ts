import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  shortDescription: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  discountPrice: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ unique: true })
  sku: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  ratingsAverage: number;

  @Prop({ default: 0 })
  ratingsCount: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
