import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards, Request
} from '@nestjs/common';
import { CoordenadorService } from '../services/coordenador.service';
import { Coordenador } from '../entities/coordenador.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';
import { ClassificarDemandaDto } from '../dto/classificar-demanda.dto';
import { GerenciarCandidaturaDto } from '../dto/gerenciar-candidatura.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Coordenadores')
@Controller('coordenadores')
export class CoordenadorController {
  constructor(private readonly coordenadorService: CoordenadorService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Coordenador[]> {
    return this.coordenadorService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Coordenador> {
    return this.coordenadorService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Get('curso/:curso')
  @HttpCode(HttpStatus.OK)
  findByCurso(@Param('curso') curso: string): Promise<Coordenador[]> {
    return this.coordenadorService.findByCurso(curso);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCoordenadorDto): Promise<Coordenador> {
    return this.coordenadorService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Coordenador', 'Admin')
  @ApiBearerAuth()
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  getDashboard(@Request() req): Promise<any> {
    return this.coordenadorService.getDashboardDados(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Coordenador', 'Admin')
  @ApiBearerAuth()
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req): Promise<Coordenador> {
    return this.coordenadorService.findByUsuarioId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Coordenador', 'Admin')
  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoordenadorDto,
  ): Promise<Coordenador> {
    return this.coordenadorService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Coordenador', 'Admin') 
  @ApiBearerAuth()
  @Put('demandas/:demIntId/classificar')
  @HttpCode(HttpStatus.OK)
  classificarDemanda(
    @Param('demIntId', ParseIntPipe) demIntId: number,
    @Body() dto: ClassificarDemandaDto,
  ): Promise<Demanda> {
    return this.coordenadorService.classificarDemanda(demIntId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Coordenador', 'Admin')
  @ApiBearerAuth()
  @Put('demandas/:demIntId/aprovar')
  @HttpCode(HttpStatus.OK)
  aprovarDemanda(@Param('demIntId', ParseIntPipe) demIntId: number): Promise<Demanda> {
    return this.coordenadorService.aprovarDemanda(demIntId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Coordenador', 'Admin')
  @ApiBearerAuth()
  @Put('candidaturas/gerenciar')
  @HttpCode(HttpStatus.OK)
  gerenciarCandidaturas(@Body() dto: GerenciarCandidaturaDto): Promise<Candidatura> {
    return this.coordenadorService.gerenciarCandidaturas(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    return { 
      statusCode: HttpStatus.OK,
      message: 'Sessão encerrada com sucesso no Osiris. Até logo!' 
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Put('inativar/:id')
  @HttpCode(HttpStatus.OK)
  inativar(@Param('id', ParseIntPipe) id: number): Promise<Coordenador> {
    return this.coordenadorService.inativar(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coordenadorService.delete(id);
  }
}