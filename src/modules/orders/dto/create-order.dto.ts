import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsObject, IsString } from 'class-validator';

export class CreateOrderDto {
    @ApiProperty({
        description: 'Payment method for the order',
        enum: ['COD', 'Card'],
        example: 'COD'
    })
    @IsEnum(['COD', 'Card'])
    @IsNotEmpty()
    paymentMethod: string;

    @ApiPropertyOptional({
        description: 'Custom shipping details (If empty, uses user profile defaults)',
        example: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            phone: '+1 234 567 890'
        }
    })
    @IsOptional()
    @IsObject()
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
    };
}

export class UpdateOrderStatusDto {
    @ApiProperty({
        description: 'New status for the order',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        example: 'Shipped'
    })
    @IsEnum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
    @IsNotEmpty()
    status: string;
}
