import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Product, ProductStatus, ProductType } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { Purchase } from '../../entities/purchase.entity';
import { Sale } from '../../entities/sale.entity';
import { Service } from '../../entities/service.entity';
import { ImeiValidator } from '../../utils/imei-validator.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    private httpService: HttpService,
  ) {}

  async validateImei(imei: string) {
    const validation = ImeiValidator.validate(imei);
    
    if (!validation.valid) {
      return validation;
    }

    const existing = await this.productRepository.findOne({
      where: { imei },
    });

    if (existing) {
      return {
        valid: false,
        error: `IMEI zaten kayıtlı (Durum: ${existing.durum})`,
        existing: true,
        product: existing,
      };
    }

    const allProducts = await this.productRepository.find();
    const statusCheck = ImeiValidator.checkImeiStatus(imei, allProducts);

    return {
      valid: true,
      message: 'IMEI doğrulandı',
      statusCheck,
    };
  }

  async create(data: {
    imei?: string;
    urun_tipi: string | ProductType;
    marka: string;
    model: string;
    renk?: string;
    alis_fiyati: number;
    satis_fiyati?: number;
    imei_durum?: string;
  }) {
    if (data.imei) {
      const validation = await this.validateImei(data.imei);
      if (!validation.valid) {
        throw new Error(validation.error || 'IMEI doğrulanamadı');
      }
    }

    const product = this.productRepository.create({
      ...data,
      urun_tipi: typeof data.urun_tipi === 'string' ? (data.urun_tipi as ProductType) : data.urun_tipi,
      durum: ProductStatus.STOKTA,
    });

    return await this.productRepository.save(product);
  }

  async findAll(filters?: { durum?: ProductStatus; marka?: string }) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images');

    if (filters?.durum) {
      query.where('product.durum = :durum', { durum: filters.durum });
    }

    if (filters?.marka) {
      query.andWhere('product.marka = :marka', { marka: filters.marka });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return product;
  }

  async findByImei(imei: string) {
    return await this.productRepository.findOne({
      where: { imei },
      relations: ['images'],
    });
  }

  async lookupImeiInfo(imei: string) {
    const validation = ImeiValidator.validate(imei);
    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
      };
    }

    const tac = imei.substring(0, 8);
    const edevletUrl = `https://www.turkiye.gov.tr/imei-sorgulama`;

    return {
      valid: true,
      imei: imei,
      tac: tac,
      edevletUrl: edevletUrl,
      message: 'IMEI formatı geçerli. Resmî kayıt sorgusu için e-Devlet\'e yönlendirileceksiniz.',
      requiresEdevlet: true,
    };
  }

  async update(id: number, data: Partial<Product>) {
    const product = await this.findOne(id);
    Object.assign(product, data);
    return await this.productRepository.save(product);
  }

  async addImage(productId: number, imageUrl: string) {
    const image = this.imageRepository.create({
      product_id: productId,
      image_url: imageUrl,
    });

    return await this.imageRepository.save(image);
  }

  async searchProductImage(marka: string, model: string) {
    if (!marka || !model) {
      return { imageUrl: null, error: 'Marka ve model bilgisi gereklidir' };
    }

    const searchQuery = `${marka} ${model} telefon`;

    const bingApiKey = process.env.BING_API_KEY;
    if (bingApiKey) {
      try {
        const bingUrl = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(searchQuery)}&count=1&safeSearch=Strict`;
        const response = await firstValueFrom(
          this.httpService.get(bingUrl, {
            headers: { 'Ocp-Apim-Subscription-Key': bingApiKey },
          })
        );
        
        if (response.data?.value?.[0]?.contentUrl) {
          return { imageUrl: response.data.value[0].contentUrl };
        }
      } catch (error: any) {
        console.error('Bing API error:', error.response?.data || error.message);
      }
    }

    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleCseId = process.env.GOOGLE_CSE_ID;
    if (googleApiKey && googleCseId) {
      try {
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCseId}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=1&safe=active`;
        const response = await firstValueFrom(this.httpService.get(googleUrl));
        
        if (response.data?.items?.[0]?.link) {
          return { imageUrl: response.data.items[0].link };
        }
      } catch (error: any) {
        console.error('Google Custom Search API error:', error.response?.data || error.message);
      }
    }

    return { 
      imageUrl: null, 
      error: 'Resim bulunamadı. Ücretsiz Bing API key almak için: https://azure.microsoft.com/free/ adresinden Azure hesabı oluşturun ve Bing Image Search API\'yi ekleyin. Sonra BING_API_KEY environment variable\'ını ayarlayın.' 
    };
  }

  async delete(id: number, force: boolean = false) {
    const product = await this.findOne(id);

    const purchases = await this.purchaseRepository.find({
      where: { product_id: id },
    });

    const sales = await this.saleRepository.find({
      where: { product_id: id },
    });

    const services = await this.serviceRepository.find({
      where: { product_id: id },
    });

    if (purchases.length > 0 || sales.length > 0 || services.length > 0) {
      if (!force) {
        const reasons: string[] = [];
        if (purchases.length > 0) {
          reasons.push(`${purchases.length} alış kaydı`);
        }
        if (sales.length > 0) {
          reasons.push(`${sales.length} satış kaydı`);
        }
        if (services.length > 0) {
          reasons.push(`${services.length} servis kaydı`);
        }

        throw new BadRequestException(
          `Bu ürün silinemez çünkü ${reasons.join(', ')} ile ilişkilidir. Önce ilişkili kayıtları silmeniz gerekiyor.`
        );
      }

      if (force) {
        await this.purchaseRepository.remove(purchases);
        await this.saleRepository.remove(sales);
        await this.serviceRepository.remove(services);
      }
    }

    await this.productRepository.remove(product);
    return { message: 'Ürün başarıyla silindi' };
  }
}

