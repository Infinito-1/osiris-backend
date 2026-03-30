import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from './entities/grupo.entity';
import { Module } from '@nestjs/common';
import { GrupoService } from './services/grupo.service';
import { GrupoController } from './controllers/grupo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo])],
  providers: [GrupoService],
  controllers: [GrupoController],
  exports: [],
})
export class GrupoModule {}
