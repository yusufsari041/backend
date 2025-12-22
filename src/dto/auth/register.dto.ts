import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class RegisterDto {
  @IsString({ message: 'Ad Soyad metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Ad Soyad gereklidir' })
  ad_soyad: string;

  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email gereklidir' })
  email: string;

  @IsString({ message: 'Şifre metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Şifre gereklidir' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  sifre: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Geçerli bir rol seçiniz' })
  rol?: UserRole;
}

