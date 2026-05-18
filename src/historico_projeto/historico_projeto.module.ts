import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { HistoricoProjeto } from './entities/historico_projeto.entity';
import { HistoricoProjetoService } from './services/historico_projeto.service';
import { HistoricoProjetoController } from './controllers/historico_projeto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoricoProjeto])],
  providers: [HistoricoProjetoService],
  controllers: [HistoricoProjetoController],
  exports: [HistoricoProjetoService],
})
export class HistoricoProjetoModule {}