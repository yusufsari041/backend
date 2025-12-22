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
  
  // CORS ayarları - Development ve Production için
  const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Origin yoksa (Postman, mobile app gibi) veya allowed origins'de varsa izin ver
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
  
  // Wait for database to be ready before starting the server
  // Use a retry mechanism to ensure the database is synchronized
  const dataSource = app.get(DataSource);
  let retries = 0;
  const maxRetries = 10;
  
  console.log('Veritabanı hazırlanıyor...');
  while (retries < maxRetries) {
    try {
      // Ensure database connection is initialized
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      
      // Try to query the database to ensure tables exist
      const userRepository = dataSource.getRepository(User);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const existingAdmin = await userRepository.findOne({ 
        where: { email: adminEmail.toLowerCase() } 
      });

      // If we got here, the table exists - create admin if needed
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
      } else {
        console.log('Admin kullanıcısı zaten mevcut.');
      }
      console.log('Veritabanı hazır!');
      break; // Success, exit retry loop
    } catch (error: any) {
      retries++;
      if (error?.code === 'SQLITE_ERROR' && error?.message?.includes('no such table')) {
        // Table doesn't exist yet, wait and retry
        if (retries < maxRetries) {
          console.log(`Veritabanı tabloları henüz hazır değil, bekleniyor... (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
      // Other errors or max retries reached
      console.error('Admin oluşturma hatası:', error?.message || error);
      break;
    }
  }
  
  // Start the server after database is ready
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend API çalışıyor: http://localhost:${port}`);
  
  const jwtSecret = process.env.JWT_SECRET || 'telefoncu-secret-key';
  if (jwtSecret === 'telefoncu-secret-key' && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  UYARI: Production ortamında varsayılan JWT_SECRET kullanılıyor! Güvenlik riski var!');
  }
}

bootstrap();

