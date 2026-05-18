import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards
} from '@nestjs/common';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Usuários')
@Controller('/usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todos os usuários' })
  findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca usuário pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Usuario | null> {
    return this.usuarioService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria um novo usuário' })
  create(@Body() dto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioService.create(dto);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza um usuário existente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<Usuario | null> {
    return this.usuarioService.update(id, dto);
  }

  // Exclusão só para Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Inativa um usuário (somente Admin)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.delete(id);
  }
}
