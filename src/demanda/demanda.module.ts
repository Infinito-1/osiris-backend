import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Demanda } from './entities/demanda.entity';
import { DemandaService } from './services/demanda.service';
import { DemandaController } from './controllers/demanda.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Demanda])],
  providers: [DemandaService],
  controllers: [DemandaController],
  exports: [],
})
export class DemandaModule {}
