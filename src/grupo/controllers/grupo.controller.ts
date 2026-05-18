import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards, Request
} from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../entities/grupo.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { UpdateGrupoDto } from '../dto/update-grupo.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Grupos')
@Controller('grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Grupo[]> {
    return this.grupoService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Grupo> {
    return this.grupoService.findById(id);
  }

  @Get('nome/:gruStrNome')
  @HttpCode(HttpStatus.OK)
  findByName(@Param('gruStrNome') grupo: string): Promise<Grupo[]> {
    return this.grupoService.findByName(grupo);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Grupo', 'Admin')
  @ApiBearerAuth()
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  getDashboard(@Request() req): Promise<any> {
    return this.grupoService.getDashboardDados(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Grupo', 'Admin')
  @ApiBearerAuth()
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req): Promise<Grupo> {
    return this.grupoService.findByUsuarioId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Grupo', 'Admin')
  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateGrupoDto
  ): Promise<Grupo> {
    return this.grupoService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Grupo', 'Admin')
  @ApiBearerAuth()
  @Post('demandas/:demIntId/candidatar')
  @HttpCode(HttpStatus.CREATED)
  seCandidatar(
    @Param('demIntId', ParseIntPipe) demIntId: number,
    @Request() req
  ): Promise<Candidatura> {
    return this.grupoService.seCandidatar(demIntId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Grupo', 'Admin')
  @ApiBearerAuth()
  @Delete('candidaturas/:canIntId/desistir')
  @HttpCode(HttpStatus.NO_CONTENT)
  desistirCandidatura(
    @Param('canIntId', ParseIntPipe) canIntId: number,
    @Request() req
  ): Promise<void> {
    return this.grupoService.desistirCandidatura(canIntId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    return { 
      statusCode: HttpStatus.OK,
      message: 'Sessão encerrada com sucesso no Osiris.' 
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Put('suspender/:id')
  @HttpCode(HttpStatus.OK)
  suspender(@Param('id', ParseIntPipe) id: number): Promise<Grupo> {
    return this.grupoService.suspender(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.grupoService.delete(id);
  }
}