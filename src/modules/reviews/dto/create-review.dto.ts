import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, Max, IsArray, IsOptional, IsMongoId } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({
        description: 'Product ID being reviewed',
        example: '60d5ecb8b487342e4c8b4567'
    })
    @IsMongoId()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'Rating from 1 to 5',
        example: 5,
        minimum: 1,
        maximum: 5
    })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({
        description: 'Review comment',
        example: 'Great product! Highly recommended.'
    })
    @IsString()
    @IsNotEmpty()
    comment: string;

    @ApiPropertyOptional({
        description: 'Optional image URLs for the review',
        example: ['image1.jpg', 'image2.jpg']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}

export class UpdateReviewStatusDto {
    @ApiProperty({
        description: 'Approval status of the review',
        example: true
    })
    @IsNotEmpty()
    isApproved: boolean;
}
