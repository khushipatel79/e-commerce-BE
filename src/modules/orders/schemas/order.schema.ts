import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;

    @Prop()
    selectedColor?: string;

    @Prop()
    selectedSize?: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: [OrderItemSchema], required: true })
    items: OrderItem[];

    @Prop({
        type: {
            street: String,
            city: String,
            state: String,
            zip: String,
            phone: String,
        },
        required: true,
    })
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
    };

    @Prop({ required: true, enum: ['COD', 'Card'], default: 'COD' })
    paymentMethod: string;

    @Prop({ required: true, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' })
    paymentStatus: string;

    @Prop({
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    })
    orderStatus: string;

    @Prop({ required: true })
    totalPrice: number;

    @Prop({ default: 0 })
    shippingPrice: number;

    @Prop({ unique: true })
    orderNumber: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre<OrderDocument>('save', async function () {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `ORD-${year}-${random}`;
    }
});
