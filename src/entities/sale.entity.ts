import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum PaymentType {
  NAKIT = 'nakit',
  HAVALE = 'havale',
  KREDI = 'kredi',
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('decimal', { precision: 10, scale: 2 })
  satis_fiyati: number;

  @Column({ nullable: true })
  musteri_adi: string;

  @Column({
    type: 'text',
    default: PaymentType.NAKIT,
  })
  odeme_tipi: PaymentType;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}

