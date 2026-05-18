import { 
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Req, HttpCode, HttpStatus 
} from '@nestjs/common';
import { CoordenadorService } from '../services/coordenador.service';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';
import { ClassificarDemandaDto } from '../dto/classificar-demanda.dto';
import { GerenciarCandidaturaDto } from '../dto/gerenciar-candidatura.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Coordenador')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coordenadores')
export class CoordenadorController {
  constructor(private readonly coordenadorService: CoordenadorService) {}

  @Get()
  @Roles('Admin', 'Coordenador')
  findAll() {
    return this.coordenadorService.findAll();
  }

  @Get('dashboard')
  @Roles('Coordenador')
  getDashboard(@Req() req: any) {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.coordenadorService.getDashboardDados(usuarioId);
  }

  @Get(':id')
  @Roles('Admin', 'Coordenador')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.findById(id);
  }

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateCoordenadorDto) {
    return this.coordenadorService.create(dto);
  }

  @Put(':id')
  @Roles('Admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCoordenadorDto) {
    return this.coordenadorService.update(id, dto);
  }

  @Put(':id/inativar')
  @Roles('Admin')
  inativar(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.inativar(id);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.delete(id);
  }

  @Put('demanda/:id/classificar')
  @Roles('Coordenador')
  classificarDemanda(@Param('id', ParseIntPipe) id: number, @Body() dto: ClassificarDemandaDto) {
    return this.coordenadorService.classificarDemanda(id, dto);
  }

  @Put('demanda/:id/aprovar')
  @Roles('Coordenador')
  aprovarDemanda(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.aprovarDemanda(id);
  }

  @Put('candidaturas/gerenciar')
  @Roles('Coordenador')
  gerenciarCandidaturas(@Body() dto: GerenciarCandidaturaDto) {
    return this.coordenadorService.gerenciarCandidaturas(dto);
  }
}