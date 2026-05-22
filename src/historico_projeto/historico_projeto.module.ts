import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricoProjeto } from './entities/historico_projeto.entity';
import { Projeto } from '../projeto/entities/projeto.entity'; 
import { HistoricoProjetoService } from './services/historico_projeto.service';
import { HistoricoProjetoController } from './controllers/historico_projeto.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HistoricoProjeto, 
      Projeto 
    ]),
  ],
  providers: [HistoricoProjetoService],
  controllers: [HistoricoProjetoController],
  exports: [HistoricoProjetoService],
})
export class HistoricoProjetoModule {}