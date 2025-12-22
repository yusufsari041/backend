import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ValidateImeiDto {
  @IsString({ message: 'IMEI metin formatında olmalıdır' })
  @IsNotEmpty({ message: 'IMEI gereklidir' })
  @Length(15, 15, { message: 'IMEI tam olarak 15 haneli olmalıdır' })
  imei: string;
}

