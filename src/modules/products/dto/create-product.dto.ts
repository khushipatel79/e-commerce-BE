import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsMongoId,
  Min
} from 'class-validator';

export class CreateProductDto {

  @ApiProperty({
    description: 'The title of the product',
    example: 'iPhone 15 Pro'
  })
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'The unique slug for the product URL',
    example: 'iphone-15-pro'
  })
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the product',
    example: 'The latest iPhone with titanium design.'
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Brief summary of the product',
    example: 'Next-gen iPhone with A17 Pro chip.'
  })
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({
    description: 'Current price of the product',
    example: 999.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Discounted price if applicable',
    example: 899.99,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 50,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  stock: number;


  @ApiPropertyOptional({
    description: 'Array of image URLs for the product',
    type: [String],
    example: ['https://example.com/iphone-front.png', 'https://example.com/iphone-back.png']
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({
    description: 'Category ID or Category Slug',
    example: 'electronics'
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Product tags',
    type: [String],
    example: ['mobile', 'apple', 'new']
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether the product is featured',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Available colors for the product',
    type: [String],
    example: ['Red', 'Blue', 'Black']
  })
  @IsOptional()
  @IsArray()
  colors?: string[];

  @ApiPropertyOptional({
    description: 'Available sizes for the product',
    type: [String],
    example: ['S', 'M', 'L', 'XL']
  })
  @IsOptional()
  @IsArray()
  sizes?: string[];
}
