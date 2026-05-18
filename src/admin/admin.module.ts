import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Demanda } from '../demanda/entities/demanda.entity';
import { Projeto } from '../projeto/entities/projeto.entity';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller'; 

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Usuario, Demanda, Projeto])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}