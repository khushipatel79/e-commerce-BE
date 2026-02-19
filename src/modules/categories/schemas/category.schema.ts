import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {

  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  icon: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentCategory: Types.ObjectId;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
