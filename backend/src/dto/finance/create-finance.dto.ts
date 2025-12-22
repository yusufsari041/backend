import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FinanceType } from '../../entities/finance.entity';

export class CreateFinanceDto {
  @IsEnum(FinanceType, { message: 'Geçerli bir tip seçiniz (gelir veya gider)' })
  @IsNotEmpty({ message: 'Tip gereklidir' })
  tip: FinanceType;

  @IsOptional()
  @IsString({ message: 'Kategori metin formatında olmalıdır' })
  kategori?: string;

  @IsNumber({}, { message: 'Tutar sayı formatında olmalıdır' })
  @IsNotEmpty({ message: 'Tutar gereklidir' })
  @Min(0, { message: 'Tutar 0 veya daha büyük olmalıdır' })
  tutar: number;

  @IsOptional()
  @IsString({ message: 'Açıklama metin formatında olmalıdır' })
  aciklama?: string;
}

