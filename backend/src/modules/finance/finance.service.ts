import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finance, FinanceType } from '../../entities/finance.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Finance)
    private financeRepository: Repository<Finance>,
  ) {}

  async create(data: {
    tip: FinanceType;
    kategori?: string;
    tutar: number;
    aciklama?: string;
  }) {
    const finance = this.financeRepository.create(data);
    return await this.financeRepository.save(finance);
  }

  async findAll(filters?: { tip?: FinanceType; startDate?: Date; endDate?: Date }) {
    const query = this.financeRepository.createQueryBuilder('finance');

    if (filters?.tip) {
      query.where('finance.tip = :tip', { tip: filters.tip });
    }

    if (filters?.startDate) {
      query.andWhere('finance.created_at >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('finance.created_at <= :endDate', { endDate: filters.endDate });
    }

    return await query.orderBy('finance.created_at', 'DESC').getMany();
  }

  async getStats() {
    const all = await this.financeRepository.find();

    const toplamGelir = all
      .filter(f => f.tip === FinanceType.GELIR)
      .reduce((sum, f) => sum + Number(f.tutar), 0);

    const toplamGider = all
      .filter(f => f.tip === FinanceType.GIDER)
      .reduce((sum, f) => sum + Number(f.tutar), 0);

    return {
      toplamGelir,
      toplamGider,
      netKar: toplamGelir - toplamGider,
    };
  }

  async delete(id: number) {
    const finance = await this.financeRepository.findOne({ where: { id } });
    if (!finance) {
      throw new NotFoundException('Finans kaydı bulunamadı');
    }
    await this.financeRepository.remove(finance);
    return { message: 'Finans kaydı başarıyla silindi' };
  }
}

