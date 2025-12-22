import { Controller, Get, Post, Body, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceType } from '../../entities/finance.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { CreateFinanceDto } from '../../dto/finance/create-finance.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post()
  async create(@Body() createFinanceDto: CreateFinanceDto) {
    return this.financeService.create(createFinanceDto);
  }

  @Get()
  async findAll(@Query('tip') tip?: string) {
    return this.financeService.findAll(tip ? { tip: tip as FinanceType } : {});
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.financeService.getStats();
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.financeService.delete(+id);
  }
}

