import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Coordenador } from './entities/coordenador.entity';
import { CoordenadorService } from './services/coordenador.service';
import { CoordenadorController } from './controllers/coordenador.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coordenador])],
  providers: [CoordenadorService],
  controllers: [CoordenadorController],
  exports: [],
})
export class CoordenadorModule {}
