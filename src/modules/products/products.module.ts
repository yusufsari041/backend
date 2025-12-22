import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { Purchase } from '../../entities/purchase.entity';
import { Sale } from '../../entities/sale.entity';
import { Service } from '../../entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Purchase, Sale, Service]),
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

