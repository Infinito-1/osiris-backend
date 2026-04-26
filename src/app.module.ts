import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DevService } from './data/dev.service';
import { GrupoModule } from './grupo/grupo.module';
import { EmpreendedorModule } from './empreendedor/empreendedor.module';
import { CoordenadorModule } from './coordenador/coordenasdor.module';
import { CandidaturaModule } from './candidatura/candidatura.module'; // <-- novo
import { DemandaModule } from './demanda/demanda.module'; // <-- importação do módulo da demanda

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
    CandidaturaModule, // <-- registro do módulo candidatura
    DemandaModule, // <-- registro do módulo da demanda
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
