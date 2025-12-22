import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateServiceDto } from '../../dto/services/create-service.dto';
import { UpdateServiceDto } from '../../dto/services/update-service.dto';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create({
      product_id: createServiceDto.product_id,
      imei: createServiceDto.imei,
      marka: createServiceDto.marka,
      model: createServiceDto.model,
      musteri_adi: createServiceDto.musteri_adi,
      ariza: createServiceDto.ariza,
      teslim_tarihi: createServiceDto.teslim_tarihi ? new Date(createServiceDto.teslim_tarihi) : undefined,
    });
  }

  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateServiceDto: UpdateServiceDto) {
    const updateData: any = { ...updateServiceDto };
    if (updateServiceDto.teslim_tarihi) {
      updateData.teslim_tarihi = new Date(updateServiceDto.teslim_tarihi);
    }
    return this.servicesService.update(+id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.servicesService.delete(+id);
  }
}

