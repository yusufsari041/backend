import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale } from '../../entities/sale.entity';
import { Product } from '../../entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Product]), ProductsModule, FinanceModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}

