/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjetoService } from '../services/projeto.service';
import { Projeto } from '../entities/projeto.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateProjetoDto } from '../dto/create-projeto.dto';
import { UpdateProjetoDto } from '../dto/update-projeto.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';

@ApiTags('Projetos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projetos')
export class ProjetoController {
  constructor(private readonly projetoService: ProjetoService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Retorna a lista de projetos ativos',
  })
  findAll(): Promise<Projeto[]> {
    return this.projetoService.findAll();
  }

  @Get('todosStatus')
  @Roles('Coordenador', 'Admin')
  todosStatus(): Promise<Projeto[]> {
    return this.projetoService.findAllStatus();
  }

  // projetos do grupo logado
  @Get('meus')
  @Roles('Grupo', 'Admin')
  meus(@Request() req): Promise<Projeto[]> {
    const usuarioId = req.user.id || req.user.usuIntId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.projetoService.findByUsuarioId(usuarioId);
  }

  @Get(':id')
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Busca os detalhes de um projeto por ID',
  })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Projeto> {
    return this.projetoService.findById(id);
  }

  @Post()
  @Roles('Coordenador', 'Admin', 'Grupo')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Cria/Inicia um projeto a partir de uma candidatura',
  })
  create(@Body() dto: CreateProjetoDto): Promise<Projeto> {
    return this.projetoService.create(dto);
  }

  // grupo toggling próprio projeto
  @Put(':id/toggle')
  @Roles('Grupo', 'Admin')
  toggle(@Param('id', ParseIntPipe) id: number): Promise<Projeto> {
    return this.projetoService.toggleAtivo(id);
  }

  // coordenador desativa com motivo
  @Put(':id/desativar')
  @Roles('Coordenador', 'Admin')
  desativar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { motivo?: string },
    @Request() req,
  ): Promise<Projeto> {
    const atorEmail = req.user?.email ?? 'coordenador';
    return this.projetoService.desativarCoordenador(id, dto.motivo, atorEmail);
  }

  // coordenador reativa após revisão
  @Put(':id/reativar')
  @Roles('Coordenador', 'Admin')
  reativar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<Projeto> {
    const atorEmail = req.user?.email ?? 'coordenador';
    return this.projetoService.reativarCoordenador(id, atorEmail);
  }

  @Put(':id')
  @Roles('Coordenador', 'Admin', 'Grupo')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Atualiza dados cadastrais do projeto',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjetoDto,
  ): Promise<Projeto> {
    return this.projetoService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Inativa logicamente um projeto no sistema',
  })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projetoService.delete(id);
  }
}
