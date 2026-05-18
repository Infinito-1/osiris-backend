import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards, Req, ParseEnumPipe
} from '@nestjs/common';
import { CandidaturaService } from '../services/candidatura.service';
import { Candidatura } from '../entities/candidatura.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateCandidaturaDto } from '../dto/create-candidatura.dto';
import { UpdateCandidaturaDto } from '../dto/update-candidatura.dto';
import { StatusCandidatura } from '../dto/status.enum';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Candidaturas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('candidaturas')
export class CandidaturaController {
  constructor(private readonly candidaturaService: CandidaturaService) {}

  @Get()
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todas as candidaturas do sistema' })
  findAll(): Promise<Candidatura[]> {
    return this.candidaturaService.findAll();
  }

  @Get(':id')
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca os detalhes de uma candidatura pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Candidatura> {
    return this.candidaturaService.findById(id);
  }

  @Get('status/:status')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Filtra candidaturas por status informado' })
  findByStatus(
    @Param('status', new ParseEnumPipe(StatusCandidatura)) status: StatusCandidatura,
  ): Promise<Candidatura[]> {
    return this.candidaturaService.findByStatus(status);
  }

  @Post()
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Registra uma nova intenção de candidatura' })
  create(@Body() dto: CreateCandidaturaDto, @Req() req: any): Promise<Candidatura> {
    const usuarioId = req.user?.id || req.user?.usuIntId;
    return this.candidaturaService.create(dto, usuarioId ? Number(usuarioId) : undefined);
  }

  @Put(':id')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza propriedades ou status da candidatura' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCandidaturaDto,
  ): Promise<Candidatura> {
    return this.candidaturaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Marca candidatura como Recusada (Inativa)' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.candidaturaService.delete(id);
  }
}