import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // env file ne read karva use thay che
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { MailModule } from './modules/mail/mail.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ContentModule } from './modules/content/content.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true  // ConfigModule aakha project ma automatically available thai jase
    }),  // .env file ne load kare che
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    MailModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    ReviewsModule,
    ContentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
