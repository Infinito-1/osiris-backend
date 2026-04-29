import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Candidatura])],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}