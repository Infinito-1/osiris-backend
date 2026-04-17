import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from './entities/semestre.entity';
import { Module } from '@nestjs/common';
import { GrupoService } from './services/semestre.service';
import { GrupoController } from './controllers/semestre.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo])],
  providers: [GrupoService],
  controllers: [GrupoController],
  exports: [],
})
export class GrupoModule {}
