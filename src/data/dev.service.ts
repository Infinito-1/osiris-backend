import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DevService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'db_osiris',
      autoLoadEntities: true, // Excelente: dispensa mapear entidades na mão aqui
      synchronize: true,    // Correto: produção e dev devem usar migrations para consistência
      logging: true,
      migrations: [__dirname + '/../../migrations/**/*.{ts,js}'], // Ajustado o nível da pasta e aceitação de TS/JS
      migrationsRun: false,   // Opcional: roda as migrações automaticamente ao iniciar o app em dev
    };
  }
}