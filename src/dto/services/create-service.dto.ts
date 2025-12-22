import { IsNumber, IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateServiceDto {
  @IsOptional()
  @IsNumber({}, { message: 'Ürün ID sayı formatında olmalıdır' })
  product_id?: number;

  @IsOptional()
  @IsString({ message: 'IMEI metin formatında olmalıdır' })
  imei?: string;

  @IsOptional()
  @IsString({ message: 'Marka metin formatında olmalıdır' })
  marka?: string;

  @IsOptional()
  @IsString({ message: 'Model metin formatında olmalıdır' })
  model?: string;

  @IsString({ message: 'Müşteri adı metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Müşteri adı gereklidir' })
  musteri_adi: string;

  @IsString({ message: 'Arıza açıklaması metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Arıza açıklaması gereklidir' })
  ariza: string;

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir tarih formatı giriniz (YYYY-MM-DD)' })
  teslim_tarihi?: string;
}

