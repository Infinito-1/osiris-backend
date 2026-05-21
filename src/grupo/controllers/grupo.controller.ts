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
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Grupos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // 👈 Aplica proteção global para o Controller
@Controller('grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Get()
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todos os grupos acadêmicos' })
  findAll(): Promise<Grupo[]> {
    return this.grupoService.findAll();
  }

  @Get(':id')
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca um grupo pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Grupo> {
    return this.grupoService.findById(id);
  }

  @Get('nome/:gruStrNome')
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca grupos por correspondência de nome' })
  findByName(@Param('gruStrNome') grupo: string): Promise<Grupo[]> {
    return this.grupoService.findByName(grupo);
  }

  @Post()
  @Roles('Admin', 'Grupo', 'Aluno') // 👈 Permite criação pelo admin ou pelo próprio aluno/grupo inicial
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria o perfil de um novo grupo' })
  create(@Body() dto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.create(dto);
  }

  @Get('dashboard')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna as métricas do painel do grupo' })
  getDashboard(@Request() req): Promise<any> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.grupoService.getDashboardDados(usuarioId);
  }

  @Get('perfil')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna o perfil do grupo logado baseado no token' })
  getPerfil(@Request() req): Promise<Grupo> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.grupoService.findByUsuarioId(usuarioId);
  }

  @Put(':id')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza os dados de um grupo' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateGrupoDto
  ): Promise<Grupo> {
    return this.grupoService.update(id, dto);
  }

  @Post('demandas/:demIntId/candidatar')
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Inscreve o grupo em uma demanda pendente' })
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
  @ApiResponse({ status: 204, description: 'Remove a candidatura do grupo de uma demanda' })
  desistirCandidatura(
    @Param('canIntId', ParseIntPipe) canIntId: number,
    @Request() req
  ): Promise<void> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.grupoService.desistirCandidatura(canIntId, usuarioId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Encerra a sessão' })
  logout(@Request() req) {
    return { 
      statusCode: HttpStatus.OK,
      message: 'Sessão encerrada com sucesso no Osiris.' 
    };
  }

  @Put('suspender/:id')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Inativa o grupo e o usuário base do sistema' })
  suspender(@Param('id', ParseIntPipe) id: number): Promise<Grupo> {
    return this.grupoService.suspender(id);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Deleta o registro do grupo do banco' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.grupoService.delete(id);
  }
}