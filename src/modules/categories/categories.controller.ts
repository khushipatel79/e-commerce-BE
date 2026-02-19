import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService) { }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiCreatedResponse({ description: 'Category created successfully', type: CreateCategoryDto })
    create(@Body() data: CreateCategoryDto, @Req() req: any) {
        return this.categoryService.create(data, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories with pagination and search' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for title' })
    @ApiOkResponse({ description: 'List of categories fetched successfully' })
    findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search?: string
    ) {
        return this.categoryService.findAll(
            Number(page),
            Number(limit),
            search
        );
    }


    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiOkResponse({ description: 'Category updated successfully' })
    update(
        @Param('id') id: string,
        @Body() data: UpdateCategoryDto
    ) {
        return this.categoryService.update(id, data);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete a category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiOkResponse({ description: 'Category deleted successfully' })
    remove(@Param('id') id: string) {
        return this.categoryService.softDelete(id);
    }


}
