import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetoController } from './controllers/projeto.controller';
import { ProjetoService } from './services/projeto.service';
import { Projeto } from './entities/projeto.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Projeto,
      Candidatura
    ]),
  ],
  controllers: [ProjetoController],
  providers: [ProjetoService],
  exports: [ProjetoService],
})
export class ProjetoModule {}