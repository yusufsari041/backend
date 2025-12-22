import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Purchase } from '../../entities/purchase.entity';
import { Product } from '../../entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Product]), ProductsModule, FinanceModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}

