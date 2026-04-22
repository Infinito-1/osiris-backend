import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DevService } from './data/dev.service';
import { GrupoModule } from './grupo/grupo.module';
import { EmpreendedorModule } from './empreendedor/empreendedor.module';
import { CoordenadorModule } from './coordenador/coordenasdor.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useClass: DevService,
      imports: [ConfigModule],
    }),
    GrupoModule,
    EmpreendedorModule,
    CoordenadorModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
