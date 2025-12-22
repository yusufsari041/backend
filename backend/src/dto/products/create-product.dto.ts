import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ProductType } from '../../entities/product.entity';

export class CreateProductDto {
  @IsOptional()
  @IsString({ message: 'IMEI metin formatında olmalıdır' })
  imei?: string;

  @IsEnum(ProductType, { message: 'Geçerli bir ürün tipi seçiniz' })
  @IsNotEmpty({ message: 'Ürün tipi gereklidir' })
  urun_tipi: ProductType;

  @IsString({ message: 'Marka metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Marka gereklidir' })
  marka: string;

  @IsString({ message: 'Model metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Model gereklidir' })
  model: string;

  @IsOptional()
  @IsString({ message: 'Renk metin formatında olmalıdır' })
  renk?: string;

  @IsNumber({}, { message: 'Alış fiyatı sayı formatında olmalıdır' })
  @IsNotEmpty({ message: 'Alış fiyatı gereklidir' })
  @Min(0, { message: 'Alış fiyatı 0 veya daha büyük olmalıdır' })
  alis_fiyati: number;

  @IsOptional()
  @IsNumber({}, { message: 'Satış fiyatı sayı formatında olmalıdır' })
  @Min(0, { message: 'Satış fiyatı 0 veya daha büyük olmalıdır' })
  satis_fiyati?: number;

  @IsOptional()
  @IsString({ message: 'IMEI durumu metin formatında olmalıdır' })
  imei_durum?: string;
}

