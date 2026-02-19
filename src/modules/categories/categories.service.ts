import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name)
        private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(data: CreateCategoryDto, userId: string) {

        const existing = await this.categoryModel.findOne({
            $or: [
                { title: data.title },
                { slug: data.slug }
            ]
        });

        if (existing) {
            throw new BadRequestException('Category title or slug already exists');
        }

        const category = new this.categoryModel({
            ...data,
            createdBy: userId
        });

        return category.save();
    }

    async findAll(page = 1, limit = 10, search?: string) {

        const query: any = { isActive: true };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const categories = await this.categoryModel
            .find(query)
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

    async update(id: string, data: UpdateCategoryDto) {

        const category = await this.categoryModel.findById(id);

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        Object.assign(category, data);

        return category.save();
    }

    async softDelete(id: string) {

        const category = await this.categoryModel.findById(id);

        if (!category) {
            throw new BadRequestException('Category not found');
        }

        category.isActive = false;

        return category.save();
    }

}
