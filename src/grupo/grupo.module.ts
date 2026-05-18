import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoService } from './services/grupo.service';
import { GrupoController } from './controllers/grupo.controller';
import { Grupo } from './entities/grupo.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Demanda } from '../demanda/entities/demanda.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grupo, 
      Usuario, 
      Demanda, 
      Candidatura
    ]),
  ],
  providers: [GrupoService],
  controllers: [GrupoController],
  exports: [GrupoService],
})
export class GrupoModule {}