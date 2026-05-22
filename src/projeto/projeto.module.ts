import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetoService } from './services/projeto.service';
import { ProjetoController } from './controllers/projeto.controller';
import { Projeto } from './entities/projeto.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Projeto,
      Candidatura, // agora o repositório será mapeado corretamente
    ]),
  ],
  providers: [ProjetoService],
  controllers: [ProjetoController],
  exports: [ProjetoService],
})
export class ProjetoModule {}
