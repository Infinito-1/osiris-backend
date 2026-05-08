import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards, Request
} from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../entities/grupo.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { UpdateGrupoDto } from '../dto/update-grupo.dto';

@Controller('/grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Grupo[]> {
    return this.grupoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Grupo | null> {
    return this.grupoService.findById(id);
  }

  @Get('grupo/:gruStrNome')
  @HttpCode(HttpStatus.OK)
  findByName(@Param('gruStrNome') grupo: string): Promise<Grupo[]> {
    return this.grupoService.findByName(grupo);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGrupoDto): Promise<Grupo | null> {
    return this.grupoService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.grupoService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req) {
    return { message: 'Usuário autenticado acessando Grupo', usuario: req.user };
  }
}
