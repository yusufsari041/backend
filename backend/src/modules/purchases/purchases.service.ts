import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from '../../entities/purchase.entity';
import { Product } from '../../entities/product.entity';
import { ProductsService } from '../products/products.service';
import { FinanceService } from '../finance/finance.service';
import { FinanceType } from '../../entities/finance.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
    private financeService: FinanceService,
  ) {}

  async create(data: {
    imei?: string;
    urun_tipi: string;
    marka: string;
    model: string;
    renk?: string;
    alis_fiyati: number;
    satis_fiyati?: number;
    tedarikci?: string;
    user_id: number;
    imei_durum?: string;
  }) {
    let product: Product;

    if (data.imei) {
      const existing = await this.productsService.findByImei(data.imei);
      if (existing) {
        product = existing;
      } else {
        product = await this.productsService.create({
          imei: data.imei,
          urun_tipi: data.urun_tipi,
          marka: data.marka,
          model: data.model,
          renk: data.renk,
          alis_fiyati: data.alis_fiyati,
          satis_fiyati: data.satis_fiyati,
          imei_durum: data.imei_durum,
        });
      }
    } else {
      product = await this.productsService.create({
        urun_tipi: data.urun_tipi,
        marka: data.marka,
        model: data.model,
        renk: data.renk,
        alis_fiyati: data.alis_fiyati,
        satis_fiyati: data.satis_fiyati,
      });
    }

    const purchase = this.purchaseRepository.create({
      product_id: product.id,
      alis_fiyati: data.alis_fiyati,
      tedarikci: data.tedarikci,
      user_id: data.user_id,
    });

    await this.purchaseRepository.save(purchase);

    const modelText = data.model.toLowerCase().includes(data.marka.toLowerCase())
      ? data.model
      : `${data.marka} ${data.model}`;
    
    await this.financeService.create({
      tip: FinanceType.GIDER,
      kategori: 'Alış',
      tutar: data.alis_fiyati,
      aciklama: `${modelText} alışı${data.tedarikci ? ` - Tedarikçi: ${data.tedarikci}` : ''}`,
    });

    return purchase;
  }

  async findAll() {
    return await this.purchaseRepository.find({
      relations: ['product', 'user'],
      order: { created_at: 'DESC' },
    });
  }
}

