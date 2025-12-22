import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum FinanceType {
  GELIR = 'gelir',
  GIDER = 'gider',
}

@Entity('finance')
export class Finance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  tip: FinanceType;

  @Column({ nullable: true })
  kategori: string;

  @Column('decimal', { precision: 10, scale: 2 })
  tutar: number;

  @Column({ nullable: true })
  aciklama: string;

  @CreateDateColumn()
  created_at: Date;
}

