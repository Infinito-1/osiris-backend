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
import { Public } from '../../auth/public.decorator';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { UpdateGrupoDto } from '../dto/update-grupo.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Grupos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos os grupos ativos na vitrine (Acesso Livre)' })
  findAll(): Promise<Grupo[]> {
    return this.grupoService.findAll();
  }


  @Public()
  @Get('nome/:gruStrNome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Filtrar grupos por correspondência de nome (Acesso Livre)' })
  findByName(@Param('gruStrNome') grupo: string): Promise<Grupo[]> {
    return this.grupoService.findByName(grupo);
  }

  @Post()
  @Roles('Admin', 'Grupo', 'Aluno')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.create(dto);
  }

  @Get('dashboard/dados')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  getDashboard(@Request() req): Promise<any> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.grupoService.getDashboardDados(usuarioId);
  }

  @Get('perfil/me')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req): Promise<Grupo> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.grupoService.findByUsuarioId(usuarioId);
  }

    @Public()
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Visualizar portfólio do grupo por ID (Acesso Livre)' })
    findById(@Param('id', ParseIntPipe) id: number): Promise<Grupo> {
      return this.grupoService.findById(id);
    }

  @Put('suspender/:id')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  suspender(@Param('id', ParseIntPipe) id: number): Promise<Grupo> {
    return this.grupoService.suspender(id);
  }

  @Put(':id')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateGrupoDto
  ): Promise<Grupo> {
    return this.grupoService.update(id, dto);
  }

  @Post('demandas/:demIntId/candidatar')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.CREATED)
  seCandidatar(
    @Param('demIntId', ParseIntPipe) demIntId: number,
    @Request() req
  ): Promise<Candidatura> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.grupoService.seCandidatar(demIntId, usuarioId);
  }

  @Delete('candidaturas/:canIntId/desistir')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  desistirCandidatura(
    @Param('canIntId', ParseIntPipe) canIntId: number,
    @Request() req
  ): Promise<void> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.grupoService.desistirCandidatura(canIntId, usuarioId);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.grupoService.delete(id);
  }
}