import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.userRepository.find({
      select: ['id', 'ad_soyad', 'email', 'rol', 'aktif_mi', 'profil_fotografi', 'created_at'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      select: ['id', 'ad_soyad', 'email', 'rol', 'aktif_mi', 'profil_fotografi', 'created_at'],
    });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    
    return user;
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'ad_soyad', 'email', 'rol', 'aktif_mi', 'profil_fotografi', 'created_at'],
    });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    
    return user;
  }

  async updateProfile(userId: number, updateData: { email?: string; ad_soyad?: string; profil_fotografi?: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    if (updateData.email && updateData.email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await this.userRepository.findOne({ 
        where: { email: updateData.email.toLowerCase() } 
      });
      
      if (existingUser) {
        throw new ConflictException('Bu email zaten kullanılıyor');
      }
      
      user.email = updateData.email.toLowerCase();
    }

    if (updateData.ad_soyad) {
      user.ad_soyad = updateData.ad_soyad;
    }

    if (updateData.profil_fotografi !== undefined) {
      user.profil_fotografi = updateData.profil_fotografi;
    }

    await this.userRepository.save(user);
    
    return {
      id: user.id,
      ad_soyad: user.ad_soyad,
      email: user.email,
      rol: user.rol,
      aktif_mi: user.aktif_mi,
      profil_fotografi: user.profil_fotografi,
      created_at: user.created_at,
    };
  }

  async changePassword(userId: number, yeniSifre: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const yeniSifreHash = await bcrypt.hash(yeniSifre, 10);
    user.sifre_hash = yeniSifreHash;
    user.ilk_giris = false;

    await this.userRepository.save(user);

    return { message: 'Şifre başarıyla değiştirildi' };
  }

  async changePasswordByAdmin(adminId: number, targetUserId: number, yeniSifre: string) {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    
    if (!admin || admin.rol !== 'admin') {
      throw new ForbiddenException('Bu işlem için admin yetkisi gereklidir');
    }

    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    
    if (!targetUser) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const yeniSifreHash = await bcrypt.hash(yeniSifre, 10);
    targetUser.sifre_hash = yeniSifreHash;
    targetUser.ilk_giris = false;

    await this.userRepository.save(targetUser);

    return { message: 'Kullanıcı şifresi başarıyla değiştirildi' };
  }

  async createUser(adminId: number, userData: { ad_soyad: string; email: string; sifre: string; rol: string }) {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    
    if (!admin || admin.rol !== 'admin') {
      throw new ForbiddenException('Bu işlem için admin yetkisi gereklidir');
    }

    const existingUser = await this.userRepository.findOne({ 
      where: { email: userData.email.toLowerCase() } 
    });
    
    if (existingUser) {
      throw new ConflictException('Bu email zaten kullanılıyor');
    }

    const sifreHash = await bcrypt.hash(userData.sifre, 10);
    const newUser = this.userRepository.create({
      ad_soyad: userData.ad_soyad,
      email: userData.email.toLowerCase(),
      sifre_hash: sifreHash,
      rol: userData.rol as any,
      aktif_mi: true,
      ilk_giris: true,
    });

    const savedUser = await this.userRepository.save(newUser);
    
    return {
      id: savedUser.id,
      ad_soyad: savedUser.ad_soyad,
      email: savedUser.email,
      rol: savedUser.rol,
      aktif_mi: savedUser.aktif_mi,
      profil_fotografi: savedUser.profil_fotografi,
      created_at: savedUser.created_at,
    };
  }

  async updateUser(adminId: number, userId: number, updateData: { ad_soyad?: string; email?: string; rol?: string; aktif_mi?: boolean }) {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    
    if (!admin || admin.rol !== 'admin') {
      throw new ForbiddenException('Bu işlem için admin yetkisi gereklidir');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    if (updateData.email && updateData.email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await this.userRepository.findOne({ 
        where: { email: updateData.email.toLowerCase() } 
      });
      
      if (existingUser) {
        throw new ConflictException('Bu email zaten kullanılıyor');
      }
      
      user.email = updateData.email.toLowerCase();
    }

    if (updateData.ad_soyad) {
      user.ad_soyad = updateData.ad_soyad;
    }

    if (updateData.rol !== undefined) {
      user.rol = updateData.rol as any;
    }

    if (updateData.aktif_mi !== undefined) {
      user.aktif_mi = updateData.aktif_mi;
    }

    await this.userRepository.save(user);
    
    return {
      id: user.id,
      ad_soyad: user.ad_soyad,
      email: user.email,
      rol: user.rol,
      aktif_mi: user.aktif_mi,
      profil_fotografi: user.profil_fotografi,
      created_at: user.created_at,
    };
  }

  async deleteUser(adminId: number, userId: number) {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    
    if (!admin || admin.rol !== 'admin') {
      throw new ForbiddenException('Bu işlem için admin yetkisi gereklidir');
    }

    if (adminId === userId) {
      throw new ForbiddenException('Kendi hesabınızı silemezsiniz');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.userRepository.remove(user);

    return { message: 'Kullanıcı başarıyla silindi' };
  }
}

