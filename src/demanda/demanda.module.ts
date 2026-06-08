import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demanda } from './entities/demanda.entity';
import { DemandaService } from './services/demanda.service';
import { DemandaController } from './controllers/demanda.controller';
import { TipoDemandaModule } from '../tipo_demanda/tipo_demanda.module'; // importa o módulo
import { LogModule } from '../log/log.module';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { Projeto } from '../projeto/entities/projeto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Demanda, Candidatura, Projeto]),
    TipoDemandaModule, // importa o módulo que já fornece TipoDemandaService
    LogModule,
  ],
  providers: [DemandaService],
  controllers: [DemandaController],
  exports: [DemandaService],
})
export class DemandaModule {}
