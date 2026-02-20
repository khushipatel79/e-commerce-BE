import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiNotFoundResponse,
    ApiForbiddenResponse
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService) { }

    // ─── Admin Routes ──────────────────────────────────────────────────────────

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    @ApiOperation({ summary: '[Admin Only] Category Route: Create a new category' })
    @ApiCreatedResponse({ description: 'Category created successfully', type: CreateCategoryDto })
    @ApiForbiddenResponse({ description: 'Forbidden. Admin role required.' })
    create(@Body() data: CreateCategoryDto, @Req() req: any) {
        return this.categoryService.create(data, req.user.userId || req.user.sub);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    @ApiOperation({ summary: '[Admin Only] Category Route: Update an existing category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiOkResponse({ description: 'Category updated successfully' })
    @ApiNotFoundResponse({ description: 'Category not found' })
    update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
        return this.categoryService.update(id, data);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    @ApiOperation({ summary: '[Admin Only] Category Route: Soft delete a category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiOkResponse({ description: 'Category deleted successfully' })
    @ApiNotFoundResponse({ description: 'Category not found' })
    remove(@Param('id') id: string) {
        return this.categoryService.softDelete(id);
    }

    // ─── Public Routes ─────────────────────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: '[Public] User Route: Get all categories with pagination and search' })
    @ApiOkResponse({ description: 'List of categories fetched successfully' })
    findAll(@Query() query: CategoryQueryDto) {
        return this.categoryService.findAll(query);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: '[Public] User Route: Get a single category by its slug' })
    @ApiOkResponse({ description: 'Category details fetched successfully' })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiParam({ name: 'slug', description: 'Category unique slug' })
    findOneBySlug(@Param('slug') slug: string) {
        return this.categoryService.findOneBySlug(slug);
    }

    @Get(':id')
    @ApiOperation({ summary: '[Public] User Route: Get a single category by its ID' })
    @ApiOkResponse({ description: 'Category details fetched successfully' })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Get(':id/subcategories')
    @ApiOperation({ summary: '[Public] User Route: Get all subcategories for a given category' })
    @ApiOkResponse({ description: 'List of subcategories fetched successfully' })
    @ApiParam({ name: 'id', description: 'Parent Category ID' })
    getSubcategories(@Param('id') id: string) {
        return this.categoryService.getSubcategories(id);
    }
}
