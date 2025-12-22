import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  PERSONEL = 'personel',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ad_soyad: string;

  @Column({ unique: true })
  email: string;

  @Column()
  sifre_hash: string;

  @Column({
    type: 'text',
    default: UserRole.PERSONEL,
  })
  rol: UserRole;

  @Column({ default: true })
  aktif_mi: boolean;

  @Column({ default: false })
  ilk_giris: boolean;

  @Column({ nullable: true })
  profil_fotografi: string;

  @CreateDateColumn()
  created_at: Date;
}

