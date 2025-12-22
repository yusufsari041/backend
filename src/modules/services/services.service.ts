import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceStatus } from '../../entities/service.entity';
import { Product, ProductStatus } from '../../entities/product.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
  ) {}

  async create(data: {
    product_id?: number;
    imei?: string;
    marka?: string;
    model?: string;
    musteri_adi: string;
    ariza: string;
    teslim_tarihi?: Date;
  }) {
    if (data.product_id) {
      const product = await this.productsService.findOne(data.product_id);

      if (product.durum === ProductStatus.SATILDI) {
        throw new BadRequestException('Satılmış ürün servise alınamaz');
      }

      product.durum = ProductStatus.SERVISTE;
      await this.productRepository.save(product);
    }

    if (!data.product_id && (!data.marka || !data.model)) {
      throw new BadRequestException('Ürün seçilmediyse marka ve model bilgisi gereklidir');
    }

    const service = this.serviceRepository.create({
      product_id: data.product_id,
      imei: data.imei,
      marka: data.marka,
      model: data.model,
      musteri_adi: data.musteri_adi,
      ariza: data.ariza,
      durum: ServiceStatus.ALINDI,
      teslim_tarihi: data.teslim_tarihi,
    });

    return await this.serviceRepository.save(service);
  }

  async findAll() {
    return await this.serviceRepository.find({
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, data: Partial<Service>) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new BadRequestException('Servis kaydı bulunamadı');
    }

    Object.assign(service, data);

    if (data.durum === ServiceStatus.TESLIM_EDILDI && service.product_id) {
      const product = await this.productsService.findOne(service.product_id);
      product.durum = ProductStatus.STOKTA;
      await this.productRepository.save(product);
    }

    return await this.serviceRepository.save(service);
  }

  async delete(id: number) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Servis kaydı bulunamadı');
    }

    if (service.durum !== ServiceStatus.TESLIM_EDILDI && service.product_id) {
      const product = await this.productsService.findOne(service.product_id);
      product.durum = ProductStatus.STOKTA;
      await this.productRepository.save(product);
    }

    await this.serviceRepository.remove(service);
    return { message: 'Servis kaydı başarıyla silindi' };
  }
}

