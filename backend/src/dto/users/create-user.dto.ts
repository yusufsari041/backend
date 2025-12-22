import { IsEmail, IsString, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Ad Soyad gereklidir' })
  @IsString({ message: 'Ad Soyad metin formatında olmalıdır' })
  ad_soyad: string;

  @IsNotEmpty({ message: 'Email gereklidir' })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email: string;

  @IsNotEmpty({ message: 'Şifre gereklidir' })
  @IsString({ message: 'Şifre metin formatında olmalıdır' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  sifre: string;

  @IsNotEmpty({ message: 'Rol gereklidir' })
  @IsEnum(UserRole, { message: 'Geçerli bir rol seçiniz' })
  rol: UserRole;
}

