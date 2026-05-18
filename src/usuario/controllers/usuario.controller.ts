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
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Usuários')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria um novo usuário e devolve rota de destino' })
  create(@Body() dto: CreateUsuarioDto): Promise<any> {
    return this.usuarioService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Empreendedor', 'Coordenador', 'Grupo')
  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.usuarioService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Empreendedor', 'Coordenador', 'Grupo')
  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usuarioService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usuarioService.delete(id);
  }
}