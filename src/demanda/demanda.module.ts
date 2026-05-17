import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demanda } from './entities/demanda.entity';
import { DemandaService } from './services/demanda.service';
import { DemandaController } from './controllers/demanda.controller';
import { TipoDemandaModule } from '../tipo_demanda/tipo_demanda.module'; // importa o módulo

@Module({
  imports: [
    TypeOrmModule.forFeature([Demanda]),
    TipoDemandaModule, // importa o módulo que já fornece TipoDemandaService
  ],
  providers: [DemandaService],
  controllers: [DemandaController],
  exports: [DemandaService],
})
export class DemandaModule {}
