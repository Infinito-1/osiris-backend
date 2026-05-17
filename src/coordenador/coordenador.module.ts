import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Coordenador } from './entities/coordenador.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Demanda } from '../demanda/entities/demanda.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { CoordenadorService } from './services/coordenador.service';
import { CoordenadorController } from './controllers/coordenador.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coordenador, Usuario, Demanda, Candidatura]),
  ],
  providers: [CoordenadorService],
  controllers: [CoordenadorController],
  exports: [CoordenadorService],
})
export class CoordenadorModule {}
