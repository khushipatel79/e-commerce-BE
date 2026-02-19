import {
  Injectable,
  BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import slugify from 'slugify';
import { Category } from '../categories/schemas/category.schema';
import { InjectModel as InjectCategoryModel } from '@nestjs/mongoose';

@Injectable()
export class ProductsService {

  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    @InjectCategoryModel(Category.name)
    private categoryModel: Model<Category>,
  ) { }

  async create(data: CreateProductDto, userId: string) {

    const category = await this.categoryModel.findById(data.category);

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const slug = data.slug
      ? slugify(data.slug, { lower: true })
      : slugify(data.title, { lower: true });

    const existingSlug = await this.productModel.findOne({ slug });
    if (existingSlug) {
      throw new BadRequestException('Product slug already exists');
    }

    if (data.sku) {
      const existingSku = await this.productModel.findOne({ sku: data.sku });
      if (existingSku) {
        throw new BadRequestException('SKU already exists');
      }
    }

    const product = new this.productModel({
      ...data,
      slug,
      createdBy: userId,
    });

    return product.save();
  }

  async findAll(queryParams: any) {

    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      sort
    } = queryParams;

    const query: any = { isActive: true };

    // 🔍 Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 📂 Filter by category
    if (category) {
      query.category = category;
    }

    // 💰 Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    let sortOption: any = { createdAt: -1 };

    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    const products = await this.productModel
      .find(query)
      .populate('category', 'title slug')
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOption);

    const total = await this.productModel.countDocuments(query);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      data: products,
    };
  }

}
