import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';
import { CategoryQueryDto } from './dto/category-query.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name)
        private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(data: CreateCategoryDto, userId: string) {
        const slug = data.slug
            ? slugify(data.slug, { lower: true })
            : slugify(data.title, { lower: true });

        const existing = await this.categoryModel.findOne({
            $or: [
                { title: data.title },
                { slug: slug }
            ]
        });

        if (existing) {
            throw new BadRequestException('Category title or slug already exists');
        }

        const category = new this.categoryModel({
            ...data,
            slug,
            createdBy: userId
        });

        return category.save();
    }

    async findAll(queryDto: CategoryQueryDto) {
        const { page = 1, limit = 10, search, parentCategory } = queryDto;

        const query: any = { isActive: true };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (parentCategory) {
            query.parentCategory = parentCategory;
        }

        const skip = (page - 1) * limit;

        const categories = await this.categoryModel
            .find(query)
            .populate('parentCategory', 'title slug')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await this.categoryModel.countDocuments(query);

        return {
            total,
            page,
            limit,
            data: categories,
        };
    }

    async findOne(id: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findById(id).populate('parentCategory', 'title slug');
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async findOneBySlug(slug: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findOne({ slug }).populate('parentCategory', 'title slug');
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async update(id: string, data: UpdateCategoryDto) {
        if (data.title && !data.slug) {
            data.slug = slugify(data.title, { lower: true });
        } else if (data.slug) {
            data.slug = slugify(data.slug, { lower: true });
        }

        const category = await this.categoryModel.findByIdAndUpdate(id, data, { new: true });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async softDelete(id: string) {
        const category = await this.categoryModel.findByIdAndDelete(id, { isActive: false });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return { message: 'Category deleted successfully' };
    }

    async getSubcategories(parentId: string): Promise<CategoryDocument[]> {
        return this.categoryModel.find({ parentCategory: parentId, isActive: true }).exec();
    }
}
