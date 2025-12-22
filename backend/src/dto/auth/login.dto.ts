import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email gereklidir' })
  email: string;

  @IsString({ message: 'Şifre metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Şifre gereklidir' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  sifre: string;
}

