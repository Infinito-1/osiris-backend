import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricoProjeto } from './entities/historico_projeto.entity';
import { Module } from '@nestjs/common';
import { HistoricoProjetoService } from './services/historico_projeto.service';
import { HistoricoProjetoController } from './controllers/historico_projeto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoricoProjeto])],
  providers: [HistoricoProjetoService],
  controllers: [HistoricoProjetoController],
  exports: [],
})
export class HistoricoProjetoModule {}
