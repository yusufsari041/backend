import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const DatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: join(process.cwd(), 'data', 'telefoncu.db'),
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};

