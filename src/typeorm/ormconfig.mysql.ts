import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { TypeOrmNamingStrategy } from './typeorm-naming-strategy';
import * as dotenv from 'dotenv';

dotenv.config();

const config = process.env;
const options: TypeOrmModuleOptions = {
  type: 'mysql',
  host: config.DB_HOST,
  port: 3306,
  username: config.DB_USER,
  password: config.DB_PASS,
  database: config.DB_NAME,
  entities: [`${__dirname}/../**/*.entity.{ts,js}`],
  migrations: [`${__dirname}/../migrations/*.{ts,js}`],
  namingStrategy: new TypeOrmNamingStrategy(),
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export = options;
