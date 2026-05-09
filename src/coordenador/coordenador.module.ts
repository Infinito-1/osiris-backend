import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Coordenador } from './entities/coordenador.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CoordenadorService } from './services/coordenador.service';
import { CoordenadorController } from './controllers/coordenador.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coordenador, Usuario])],
  providers: [CoordenadorService],
  controllers: [CoordenadorController],
  exports: [CoordenadorService],
})
export class CoordenadorModule {}
