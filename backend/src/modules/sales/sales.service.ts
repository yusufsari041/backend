import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, PaymentType } from '../../entities/sale.entity';
import { Product, ProductStatus } from '../../entities/product.entity';
import { ProductsService } from '../products/products.service';
import { FinanceService } from '../finance/finance.service';
import { FinanceType } from '../../entities/finance.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
    private financeService: FinanceService,
  ) {}

  async create(data: {
    product_id: number;
    satis_fiyati: number;
    musteri_adi?: string;
    odeme_tipi: string | PaymentType;
    user_id: number;
  }) {
    const product = await this.productsService.findOne(data.product_id);

    if (product.durum !== ProductStatus.STOKTA) {
      throw new BadRequestException('Bu ürün satılamaz (Stokta değil veya serviste)');
    }

    const odemeTipi = typeof data.odeme_tipi === 'string' 
      ? (data.odeme_tipi as PaymentType) 
      : data.odeme_tipi;

    const sale = this.saleRepository.create({
      product_id: data.product_id,
      satis_fiyati: data.satis_fiyati,
      musteri_adi: data.musteri_adi,
      odeme_tipi: odemeTipi,
      user_id: data.user_id,
    });

    await this.saleRepository.save(sale);

    product.durum = ProductStatus.SATILDI;
    await this.productRepository.save(product);

    const modelText = product.model.toLowerCase().includes(product.marka.toLowerCase())
      ? product.model
      : `${product.marka} ${product.model}`;
    
    await this.financeService.create({
      tip: FinanceType.GELIR,
      kategori: 'Satış',
      tutar: data.satis_fiyati,
      aciklama: `${modelText} satışı`,
    });

    return sale;
  }

  async findAll() {
    return await this.saleRepository.find({
      relations: ['product', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async getStats() {
    const sales = await this.saleRepository.find({ relations: ['product'] });
    
    const toplamCiro = sales.reduce((sum, sale) => sum + Number(sale.satis_fiyati), 0);
    const toplamKar = sales.reduce((sum, sale) => {
      const kar = Number(sale.satis_fiyati) - Number(sale.product.alis_fiyati);
      return sum + kar;
    }, 0);

    return {
      toplamSatis: sales.length,
      toplamCiro,
      toplamKar,
    };
  }
}

