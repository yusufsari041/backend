import { IsNumber, IsNotEmpty, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { PaymentType } from '../../entities/sale.entity';

export class CreateSaleDto {
  @IsNumber({}, { message: 'Ürün ID sayı formatında olmalıdır' })
  @IsNotEmpty({ message: 'Ürün ID gereklidir' })
  product_id: number;

  @IsNumber({}, { message: 'Satış fiyatı sayı formatında olmalıdır' })
  @IsNotEmpty({ message: 'Satış fiyatı gereklidir' })
  @Min(0, { message: 'Satış fiyatı 0 veya daha büyük olmalıdır' })
  satis_fiyati: number;

  @IsOptional()
  @IsString({ message: 'Müşteri adı metin formatında olmalıdır' })
  musteri_adi?: string;

  @IsEnum(PaymentType, { message: 'Geçerli bir ödeme tipi seçiniz' })
  @IsNotEmpty({ message: 'Ödeme tipi gereklidir' })
  odeme_tipi: PaymentType;
}

