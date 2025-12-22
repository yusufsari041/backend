import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../../entities/log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async create(userId: number | null, islem: string, detay?: string) {
    const log = this.logRepository.create({
      user_id: userId,
      islem,
      detay,
    });

    return await this.logRepository.save(log);
  }

  async findAll() {
    return await this.logRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }
}

