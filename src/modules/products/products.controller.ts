import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';


import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({ description: 'Product created successfully', type: CreateProductDto })
  create(@Body() data: CreateProductDto, @Req() req: any) {
    return this.productsService.create(data, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({ description: 'List of products fetched successfully' })
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

}
