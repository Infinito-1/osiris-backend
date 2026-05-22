import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource(
  isProduction
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: false,
        synchronize: false,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        entities: [__dirname + '/../**/*.entity.js'],
        migrations: [__dirname + '/../migrations/**/*.js'],
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_DATABASE || 'db_osiris',
        logging: true,
        synchronize: false,
        entities: [__dirname + '/../**/*.entity.{ts,js}'],
        migrations: [__dirname + '/../migrations/**/*.{ts,js}'], // Suporta TS local e JS buildado
      }
);