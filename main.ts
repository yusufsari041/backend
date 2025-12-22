import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend API çalışıyor: http://localhost:${port}`);
  
  setTimeout(async () => {
    try {
      const dataSource = app.get(DataSource);
      const userRepository = dataSource.getRepository(User);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const existingAdmin = await userRepository.findOne({ 
        where: { email: adminEmail.toLowerCase() } 
      });

      if (!existingAdmin) {
        const adminPassword = process.env.ADMIN_PASSWORD || '123456';
        const sifre_hash = await bcrypt.hash(adminPassword, 10);
        const admin = userRepository.create({
          ad_soyad: 'Admin',
          email: adminEmail.toLowerCase(),
          sifre_hash,
          rol: UserRole.ADMIN,
          aktif_mi: true,
          ilk_giris: true,
        });
        await userRepository.save(admin);
        console.log(`Admin kullanıcısı otomatik oluşturuldu: ${adminEmail} / ${adminPassword}`);
      }
    } catch (error: any) {
      console.error('Admin oluşturma hatası:', error?.message || error);
    }
  }, 3000);
  
  const jwtSecret = process.env.JWT_SECRET || 'telefoncu-secret-key';
  if (jwtSecret === 'telefoncu-secret-key' && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  UYARI: Production ortamında varsayılan JWT_SECRET kullanılıyor! Güvenlik riski var!');
  }
}

bootstrap();

