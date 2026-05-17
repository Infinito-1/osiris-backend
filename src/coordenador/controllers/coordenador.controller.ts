import {
  Body,
  Controller,
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
import { CoordenadorService } from '../services/coordenador.service';
import { Coordenador } from '../entities/coordenador.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';
import { ClassificarDemandaDto } from '../dto/classificar-demanda.dto';
import { GerenciarCandidaturaDto } from '../dto/gerenciar-candidatura.dto';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';

import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Coordenadores')
@ApiBearerAuth()
@Controller('coordenadores')
export class CoordenadorController {
  constructor(private readonly coordenadorService: CoordenadorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Coordenador[]> {
    return this.coordenadorService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Coordenador | null> {
    return this.coordenadorService.findById(id);
  }

  @Get('curso/:nomeCurso')
  @HttpCode(HttpStatus.OK)
  findByCurso(@Param('nomeCurso') curso: string): Promise<Coordenador[]> {
    return this.coordenadorService.findByCurso(curso);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCoordenadorDto): Promise<Coordenador> {
    return this.coordenadorService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoordenadorDto,
  ): Promise<Coordenador | null> {
    return this.coordenadorService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req): { message: string; usuario: any } {
    return {
      message: 'Usuário autenticado acessando Coordenador',
      usuario: req.user,
    };
  }

  // UC-03 — Classificar Demandas
  @UseGuards(JwtAuthGuard)
  @Post(':id/classificar')
  classificarDemanda(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClassificarDemandaDto,
  ): Promise<Demanda> {
    return this.coordenadorService.classificarDemanda(id, dto);
  }

  // UC-04 — Aprovar Demandas
  @UseGuards(JwtAuthGuard)
  @Post(':id/aprovar')
  aprovarDemanda(@Param('id', ParseIntPipe) id: number): Promise<Demanda> {
    return this.coordenadorService.aprovarDemanda(id);
  }

  // UC-05 — Gerenciar Candidaturas
  @UseGuards(JwtAuthGuard)
  @Post(':id/candidaturas')
  gerenciarCandidaturas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GerenciarCandidaturaDto,
  ): Promise<Candidatura> {
    return this.coordenadorService.gerenciarCandidaturas(id, dto);
  }
}
