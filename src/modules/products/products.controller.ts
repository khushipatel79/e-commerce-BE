import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  Patch,
  Delete
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiNotFoundResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // ─── Admin Routes ──────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: '[Admin Only] Product Route: Create a new product' })
  @ApiCreatedResponse({ description: 'Product created successfully', type: CreateProductDto })
  @ApiForbiddenResponse({ description: 'Forbidden. Admin role required.' })
  create(@Body() data: CreateProductDto, @Req() req: any) {
    return this.productsService.create(data, req.user.userId || req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: '[Admin Only] Product Route: Update an existing product' })
  @ApiOkResponse({ description: 'Product updated successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: '[Admin Only] Product Route: Delete a product' })
  @ApiOkResponse({ description: 'Product deleted successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // ─── Public Routes ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: '[Public] User Route: Get all products with filtering and pagination' })
  @ApiOkResponse({ description: 'List of products fetched successfully' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: '[Public] User Route: Get a single product by its slug' })
  @ApiOkResponse({ description: 'Product details fetched successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({ name: 'slug', description: 'Product unique slug' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: '[Public] User Route: Get a single product by its ID' })
  @ApiOkResponse({ description: 'Product details fetched successfully' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: '[Public] User Route: Get related products' })
  @ApiOkResponse({ description: 'List of related products fetched successfully' })
  @ApiNotFoundResponse({ description: 'Main product not found' })
  @ApiParam({ name: 'id', description: 'The ID of the product to find related items for' })
  getRelated(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }
}
