import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Use environment variable for data directory if provided (useful for production)
// Otherwise use 'data' directory in current working directory
const dataDir = process.env.DATABASE_DIR || join(process.cwd(), 'data');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  try {
    mkdirSync(dataDir, { recursive: true });
    console.log(`Veritabanı dizini oluşturuldu: ${dataDir}`);
  } catch (error: any) {
    console.error(`Veritabanı dizini oluşturulamadı: ${error.message}`);
    throw error;
  }
}

export const DatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: join(dataDir, 'telefoncu.db'),
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  synchronize: true, // Auto-create tables (use migrations in production for better control)
  logging: process.env.NODE_ENV === 'development',
  // Add connection options for better reliability
  extra: {
    // SQLite connection pool options
    connectionLimit: 1,
  },
};

