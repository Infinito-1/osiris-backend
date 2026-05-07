import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../entities/usuario.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Usuario | null> {
    return this.usuarioService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() usuario: Usuario): Promise<Usuario> {
    return this.usuarioService.create(usuario);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() usuario: Usuario,
  ): Promise<Usuario | null> {
    return this.usuarioService.update(id, usuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usuarioService.delete(id);
  }

  // 🔒 Rota protegida com JWT
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req) {
    // req.user vem do JwtStrategy.validate()
    return {
      message: 'Usuário autenticado com sucesso!',
      usuario: req.user,
    };
  }
}
