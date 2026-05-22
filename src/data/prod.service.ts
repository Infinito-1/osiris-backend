import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class ProdService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      logging: false,
      dropSchema: false,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      synchronize: false,
      autoLoadEntities: true,
      migrations: [__dirname + '/../../migrations/**/*.js'], // Ajustado o nível de subida da pasta para o build (dist/)
      migrationsRun: false,  // Em produção, o ideal é rodar via script de CI/CD.
    };
  }
}