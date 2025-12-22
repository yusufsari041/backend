import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum ServiceStatus {
  ALINDI = 'alindi',
  TAMIRDE = 'tamirde',
  PARCA_BEKLİYOR = 'parca_bekliyor',
  TESLIM_EDILDI = 'teslim_edildi',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  product_id: number;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  imei: string;

  @Column({ nullable: true })
  marka: string;

  @Column({ nullable: true })
  model: string;

  @Column()
  musteri_adi: string;

  @Column('text')
  ariza: string;

  @Column({
    type: 'text',
    default: ServiceStatus.ALINDI,
  })
  durum: ServiceStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  iscilik_ucreti: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  parca_ucreti: number;

  @Column({ type: 'date', nullable: true })
  teslim_tarihi: Date;

  @CreateDateColumn()
  created_at: Date;
}

