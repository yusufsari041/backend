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
    : [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://[::1]:5173',
        'http://[::1]:3000'
      ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Development ortamında tüm origin'lere izin ver (Windows uyumluluğu için)
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }
      
      // Production'da:
      // 1. Origin yoksa (Electron, Android, Postman gibi native app'ler) -> İZİN VER
      // 2. Allowed origins'de varsa -> İZİN VER
      // 3. Render.com frontend'den geliyorsa -> İZİN VER
      if (!origin) {
        // Origin yok = Native app (Electron, Android, Postman)
        callback(null, true);
        return;
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      
      // Render.com frontend'den geliyorsa izin ver
      if (origin.includes('onrender.com') || origin.includes('frontend-g5op.onrender.com')) {
        callback(null, true);
        return;
      }
      
      console.warn(`CORS: İzin verilmeyen origin: ${origin}`);
      callback(new Error('CORS policy violation'));
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
  try {
    await app.listen(port);
    console.log(`Backend API çalışıyor: http://localhost:${port}`);
  } catch (error: any) {
    if (error?.code === 'EADDRINUSE') {
      console.error('\n❌ HATA: Port zaten kullanımda!');
      console.error(`Port ${port} başka bir süreç tarafından kullanılıyor.`);
      console.error('\nÇözüm seçenekleri:');
      console.error('1. Portu kullanan süreci sonlandırın:');
      console.error(`   Windows: netstat -ano | findstr :${port}`);
      console.error(`   Sonra: taskkill /PID <PID_NUMARASI> /F`);
      console.error('\n2. Farklı bir port kullanın:');
      console.error(`   PORT=3002 npm run start:dev`);
      console.error('\n3. Tüm Node.js süreçlerini sonlandırın:');
      console.error('   Windows: taskkill /F /IM node.exe');
      process.exit(1);
    } else {
      throw error;
    }
  }
  
  const jwtSecret = process.env.JWT_SECRET || 'telefoncu-secret-key';
  if (jwtSecret === 'telefoncu-secret-key' && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  UYARI: Production ortamında varsayılan JWT_SECRET kullanılıyor! Güvenlik riski var!');
  }
}

bootstrap().catch((error) => {
  console.error('Uygulama başlatılamadı:', error);
  process.exit(1);
});

