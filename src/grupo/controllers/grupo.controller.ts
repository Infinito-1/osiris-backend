import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards, Request
} from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../entities/grupo.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { UpdateGrupoDto } from '../dto/update-grupo.dto';

// 🔑 Swagger decorators
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Grupos')
@ApiBearerAuth()
@Controller('/grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todos os grupos' })
  findAll(): Promise<Grupo[]> {
    return this.grupoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca grupo pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Grupo | null> {
    return this.grupoService.findById(id);
  }

 
  @Get('/nome/:gruStrNome')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca grupos pelo nome' })
  findByName(@Param('gruStrNome') grupo: string): Promise<Grupo[]> {
    return this.grupoService.findByName(grupo);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria um novo grupo' })
  create(@Body() dto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza um grupo existente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGrupoDto): Promise<Grupo | null> {
    return this.grupoService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Remove um grupo' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.grupoService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna perfil do grupo autenticado' })
  getPerfil(@Request() req) {
    return { message: 'Usuário autenticado acessando Grupo', usuario: req.user };
  }
}
