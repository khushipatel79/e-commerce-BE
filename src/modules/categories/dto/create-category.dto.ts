import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean
} from 'class-validator';

export class CreateCategoryDto {

  @ApiProperty({
    description: 'The title of the category',
    example: 'Electronics'
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The slug for the category URL',
    example: 'electronics'
  })
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the category',
    example: 'Gadgets, appliances and more'
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL of the category image',
    example: 'https://example.com/images/electronics.png'
  })
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Icon name or URL for the category',
    example: 'cpu'
  })
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the category',
    type: [String],
    example: ['tech', 'gadgets']
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Best Electronics Online'
  })
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Shop the best electronics online with great discounts.'
  })
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'ID of the parent category if this is a subcategory',
    example: '60d5ecb8b487342e4c8b4567'
  })
  @IsOptional()
  parentCategory?: string;

  @ApiPropertyOptional({
    description: 'Whether this category should be featured on the homepage',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the category is active',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
