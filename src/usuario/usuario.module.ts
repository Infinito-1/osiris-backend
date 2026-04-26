import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './services/usuario.service';
import { UsuarioController } from './controllers/usuario.controller';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  providers: [UsuarioService],
  controllers: [UsuarioController],
  exports: [UsuarioService]
})
export class UsuarioModule {}
