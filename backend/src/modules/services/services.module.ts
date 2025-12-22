import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from '../../entities/service.entity';
import { Product } from '../../entities/product.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Product]), ProductsModule],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}

