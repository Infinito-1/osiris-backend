import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DevService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'db_osiris',
      autoLoadEntities: true,
      synchronize: false, // desligado para usar migrations
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    };
  }
}
