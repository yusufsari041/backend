import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductStatus } from '../../entities/product.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateProductDto } from '../../dto/products/create-product.dto';
import { ValidateImeiDto } from '../../dto/products/validate-imei.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post('validate-imei')
  async validateImei(@Body() validateImeiDto: ValidateImeiDto) {
    return this.productsService.validateImei(validateImeiDto.imei);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(@Query('durum') durum?: string, @Query('marka') marka?: string) {
    const filters: any = {};
    if (durum) filters.durum = durum as ProductStatus;
    if (marka) filters.marka = marka;
    return this.productsService.findAll(filters);
  }

  @Get('imei/:imei')
  async findByImei(@Param('imei') imei: string) {
    return this.productsService.findByImei(imei);
  }

  @Post('lookup-imei')
  async lookupImei(@Body() validateImeiDto: ValidateImeiDto) {
    return this.productsService.lookupImeiInfo(validateImeiDto.imei);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.productsService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: Partial<CreateProductDto>) {
    return this.productsService.update(+id, body);
  }

  @Post(':id/images')
  async addImage(@Param('id') id: number, @Body() body: { image_url: string }) {
    return this.productsService.addImage(+id, body.image_url);
  }

  @Get('search-image')
  async searchImage(@Query('marka') marka: string, @Query('model') model: string) {
    return this.productsService.searchProductImage(marka, model);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('force') force?: string) {
    return this.productsService.delete(+id, force === 'true');
  }
}

