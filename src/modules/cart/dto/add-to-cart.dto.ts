import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({
        description: 'Product ID to add to cart',
        example: '60d5ecb8b487342e4c8b4567'
    })
    @IsMongoId()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'Quantity of the product',
        example: 1,
        minimum: 1
    })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({
        description: 'Selected color for the product',
        example: 'Red'
    })
    @IsOptional()
    @IsString()
    selectedColor?: string;

    @ApiPropertyOptional({
        description: 'Selected size for the product',
        example: 'XL'
    })
    @IsOptional()
    @IsString()
    selectedSize?: string;
}
