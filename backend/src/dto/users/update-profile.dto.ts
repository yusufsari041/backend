import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Ad Soyad metin formatında olmalıdır' })
  ad_soyad?: string;

  @IsOptional()
  @IsString({ message: 'Profil fotoğrafı URL metin formatında olmalıdır' })
  profil_fotografi?: string;
}

