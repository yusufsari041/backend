import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Eski şifre metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Eski şifre gereklidir' })
  eski_sifre: string;

  @IsString({ message: 'Yeni şifre metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'Yeni şifre gereklidir' })
  @MinLength(6, { message: 'Yeni şifre en az 6 karakter olmalıdır' })
  yeni_sifre: string;
}

