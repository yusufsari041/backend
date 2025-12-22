import { IsEmail, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Ad Soyad metin formatında olmalıdır' })
  ad_soyad?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Geçerli bir rol seçiniz' })
  rol?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'Aktif durumu boolean olmalıdır' })
  aktif_mi?: boolean;
}

