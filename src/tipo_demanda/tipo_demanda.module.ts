import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDemanda } from './entities/tipo_demanda.entity';
import { Module } from '@nestjs/common';
import { TipoDemandaService } from './services/tipo_demanda.services';
import { TipoDemandaController } from './controllers/tipo_demanda.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDemanda])],
  providers: [TipoDemandaService],
  controllers: [TipoDemandaController],
  exports: [],
})
export class TipoDemandaModule {}
