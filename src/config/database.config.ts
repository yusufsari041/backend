import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const DatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: join(process.cwd(), 'data', 'telefoncu.db'),
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};

