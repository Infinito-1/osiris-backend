import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetoService } from './services/projeto.service';
import { ProjetoController } from './controllers/projeto.controller';
import { Projeto } from './entities/projeto.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { HistoricoProjeto } from '../historico_projeto/entities/historico_projeto.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Projeto, Candidatura, HistoricoProjeto, Grupo]),
    LogModule,
  ],
  providers: [ProjetoService],
  controllers: [ProjetoController],
  exports: [ProjetoService],
})
export class ProjetoModule {}
