import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturaController } from './controllers/candidatura.controller';
import { CandidaturaService } from './services/candidatura.service';
import { Candidatura } from './entities/candidatura.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Demanda } from '../demanda/entities/demanda.entity';
import { Coordenador } from '../coordenador/entities/coordenador.entity';
import { Projeto } from '../projeto/entities/projeto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidatura,
      Grupo,
      Demanda,
      Coordenador,
      Projeto,
    ]),
  ],
  controllers: [CandidaturaController],
  providers: [CandidaturaService],
  exports: [CandidaturaService],
})
export class CandidaturaModule {}
