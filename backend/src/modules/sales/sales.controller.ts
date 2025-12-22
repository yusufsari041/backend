import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateSaleDto } from '../../dto/sales/create-sale.dto';
import { CurrentUser } from '../../decorators/user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  async create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.create({
      ...createSaleDto,
      user_id: user.id,
    });
  }

  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.salesService.getStats();
  }
}

