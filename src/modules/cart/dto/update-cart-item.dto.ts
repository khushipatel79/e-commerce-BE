import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId, IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
    @ApiProperty({
        description: 'Product ID to update quantity for',
        example: '60d5ecb8b487342e4c8b4567'
    })
    @IsMongoId()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'New quantity for the product',
        example: 2,
        minimum: 1
    })
    @IsNumber()
    @Min(1)
    quantity: number;
}
