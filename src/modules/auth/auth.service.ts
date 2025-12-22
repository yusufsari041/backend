import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, sifre: string) {
    if (!email || !sifre) {
      throw new UnauthorizedException('Email ve şifre gereklidir');
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    const user = await this.userRepository.findOne({ 
      where: { email: trimmedEmail } 
    });

    if (!user) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    if (!user.aktif_mi) {
      throw new UnauthorizedException('Hesabınız aktif değil');
    }

    const isValid = await bcrypt.compare(sifre, user.sifre_hash);

    if (!isValid) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    return {
      token,
      user: {
        id: user.id,
        ad_soyad: user.ad_soyad,
        email: user.email,
        rol: user.rol,
        ilk_giris: user.ilk_giris,
      },
      requiresPasswordChange: user.ilk_giris,
    };
  }

  async register(ad_soyad: string, email: string, sifre: string, rol: UserRole = UserRole.PERSONEL) {
    const trimmedEmail = email.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();
    
    const exists = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: trimmedEmail })
      .getOne();

    if (exists) {
      throw new ConflictException('Bu email zaten kayıtlı');
    }

    const sifre_hash = await bcrypt.hash(sifre, 10);

    const user = this.userRepository.create({
      ad_soyad,
      email: normalizedEmail,
      sifre_hash: sifre_hash,
      rol,
      ilk_giris: true,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      ad_soyad: user.ad_soyad,
      email: user.email,
      rol: user.rol,
    };
  }

  async changePassword(userId: number, eskiSifre: string, yeniSifre: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    const isValid = await bcrypt.compare(eskiSifre, user.sifre_hash);

    if (!isValid) {
      throw new UnauthorizedException('Eski şifre hatalı');
    }

    const yeniSifreHash = await bcrypt.hash(yeniSifre, 10);

    user.sifre_hash = yeniSifreHash;
    user.ilk_giris = false;

    await this.userRepository.save(user);

    return {
      message: 'Şifre başarıyla değiştirildi',
    };
  }
}

