import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product-image.entity';

export enum ProductType {
  TELEFON = 'telefon',
  AKSESUAR = 'aksesuar',
}

export enum ProductStatus {
  STOKTA = 'stokta',
  SATILDI = 'satildi',
  SERVISTE = 'serviste',
  IADE = 'iade',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  imei: string;

  @Column({
    type: 'text',
    default: ProductType.TELEFON,
  })
  urun_tipi: ProductType;

  @Column()
  marka: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  renk: string;

  @Column('decimal', { precision: 10, scale: 2 })
  alis_fiyati: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  satis_fiyati: number;

  @Column({
    type: 'text',
    default: ProductStatus.STOKTA,
  })
  durum: ProductStatus;

  @Column({ nullable: true })
  imei_durum: string;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @CreateDateColumn()
  created_at: Date;
}

