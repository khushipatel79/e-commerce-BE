import {
  Injectable,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
    let categoryId: any = data.category;

    // 💡 Support Category ID or Slug
    if (!Types.ObjectId.isValid(data.category)) {
      const category = await this.categoryModel.findOne({ slug: data.category });
      if (!category) {
        throw new BadRequestException('Category not found (Invalid ID or Slug)');
      }
      categoryId = category._id;
    } else {
      const category = await this.categoryModel.findById(data.category);
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    const slug = data.slug
      ? slugify(data.slug, { lower: true })
      : slugify(data.title, { lower: true });

    const existingSlug = await this.productModel.findOne({ slug });
    if (existingSlug) {
      throw new BadRequestException('Product slug already exists');
    }


    const product = new this.productModel({
      ...data,
      category: categoryId,
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
      colors,
      sizes,
      sort
    } = queryParams;

    const query: any = { isActive: true };

    // 🔍 Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 📂 Filter by category
    if (category) {
      // 💡 Also support filtering by category slug in the query
      if (!Types.ObjectId.isValid(category)) {
        const cat = await this.categoryModel.findOne({ slug: category });
        if (cat) query.category = cat._id;
        else query.category = new Types.ObjectId(); // Ensure empty result if slug not found
      } else {
        query.category = category;
      }
    }

    // 🎨 Color filter
    if (colors) {
      const colorArray = Array.isArray(colors) ? colors : colors.split(',');
      query.colors = { $in: colorArray };
    }

    // 📏 Size filter
    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : sizes.split(',');
      query.sizes = { $in: sizeArray };
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

  async findById(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Product ID');
    }
    const product = await this.productModel.findById(id).populate('category', 'title slug');
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findOneBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ slug }).populate('category', 'title slug');
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Product ID');
    }

    if (data.category && data.category !== '60d5ecb8b487342e4c8b4567' && data.category.trim() !== '') {
      // 💡 Support Category ID or Slug
      if (!Types.ObjectId.isValid(data.category)) {
        const category = await this.categoryModel.findOne({ slug: data.category });
        if (!category) {
          throw new BadRequestException(`Category with slug "${data.category}" not found. TIP: Check "category" in your Request Body.`);
        }
        data.category = category._id.toString();
      } else {
        const category = await this.categoryModel.findById(data.category);
        if (!category) {
          throw new BadRequestException(`Category with ID "${data.category}" not found. TIP: Check "category" in your Request Body.`);
        }
      }
    } else if (data.category === '60d5ecb8b487342e4c8b4567' || data.category === '') {
      // 💡 If the user didn't change the dummy Swagger ID, remove it so we don't try to update to a non-existent category
      delete data.category;
    }

    if (data.title && !data.slug) {
      data.slug = slugify(data.title, { lower: true });
    } else if (data.slug) {
      data.slug = slugify(data.slug, { lower: true });
    }

    const product = await this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async getRelatedProducts(productId: string): Promise<ProductDocument[]> {
    const product = await this.findById(productId);

    // 💡 Extract the actual ID from the populated category object
    // product.category might be a populated object or just an ID
    const categoryId = product.category && (product.category as any)._id
      ? (product.category as any)._id
      : product.category;

    if (!categoryId) {
      return [];
    }

    // 🔍 Search for other products in the same category
    // We use $in to support both String and ObjectId formats if they are mismatched in the DB
    return this.productModel
      .find({
        category: { $in: [categoryId, categoryId.toString()] },
        _id: { $ne: product._id },
        isActive: true
      })
      .limit(4)
      .populate('category', 'title slug')
      .exec();
  }
}
