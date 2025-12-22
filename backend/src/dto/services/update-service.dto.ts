import { IsOptional, IsString, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { ServiceStatus } from '../../entities/service.entity';

export class UpdateServiceDto {
  @IsOptional()
  @IsString({ message: 'Müşteri adı metin formatında olmalıdır' })
  musteri_adi?: string;

  @IsOptional()
  @IsString({ message: 'Arıza açıklaması metin formatında olmalıdır' })
  ariza?: string;

  @IsOptional()
  @IsEnum(ServiceStatus, { message: 'Geçerli bir durum seçiniz' })
  durum?: ServiceStatus;

  @IsOptional()
  @IsNumber({}, { message: 'İşçilik ücreti sayı formatında olmalıdır' })
  @Min(0, { message: 'İşçilik ücreti 0 veya daha büyük olmalıdır' })
  iscilik_ucreti?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Parça ücreti sayı formatında olmalıdır' })
  @Min(0, { message: 'Parça ücreti 0 veya daha büyük olmalıdır' })
  parca_ucreti?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir tarih formatı giriniz (YYYY-MM-DD)' })
  teslim_tarihi?: string;
}

