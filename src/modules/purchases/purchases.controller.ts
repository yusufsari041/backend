import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreatePurchaseDto } from '../../dto/purchases/create-purchase.dto';
import { CurrentUser } from '../../decorators/user.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @CurrentUser() user: any) {
    return this.purchasesService.create({
      ...createPurchaseDto,
      user_id: user.id,
    });
  }

  @Get()
  async findAll() {
    return this.purchasesService.findAll();
  }
}

