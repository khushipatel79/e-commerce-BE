import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
    @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ description: 'Number of items per page', example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({ description: 'Search term for product title', example: 'iPhone' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Filter by Category ID', example: '60d5ecb8b487342e4c8b4567' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Minimum price filter', example: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({ description: 'Maximum price filter', example: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({ description: 'Filter by colors (comma separated)', example: 'Red,Black' })
    @IsOptional()
    @IsString()
    colors?: string;

    @ApiPropertyOptional({ description: 'Filter by sizes (comma separated)', example: 'S,M,L' })
    @IsOptional()
    @IsString()
    sizes?: string;

    @ApiPropertyOptional({
        description: 'Sort option',
        enum: ['price_asc', 'price_desc', 'newest'],
        example: 'price_asc',
        default: 'newest'
    })
    @IsOptional()
    @IsString()
    sort?: string;
}
