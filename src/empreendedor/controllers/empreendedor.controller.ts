import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards, Request
} from '@nestjs/common';
import { EmpreendedorService } from '../services/empreendedor.service';
import { Empreendedor } from '../entities/empreendedor.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Public } from '../../auth/public.decorator';
import { CreateEmpreendedorDto } from '../dto/create-empreendedor.dto';
import { UpdateEmpreendedorDto } from '../dto/update-empreendedor.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Empreendedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 Proteção padrão para todo o módulo corporativo
@Controller('empreendedores')
export class EmpreendedorController {
  constructor(private readonly mapEmpreendedorService: EmpreendedorService) {}

  @Get()
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos os empreendedores parceiros (Gerencial)' })
  findAll(): Promise<Empreendedor[]> {
    return this.mapEmpreendedorService.findAll();
  }

  @Get(':id')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Empreendedor> {
    return this.mapEmpreendedorService.findById(id);
  }

  @Public() //Rota aberta para permitir o auto-cadastro de novas empresas no Osiris
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar uma nova conta corporativa de empreendedor' })
  create(@Body() dto: CreateEmpreendedorDto): Promise<Empreendedor> {
    return this.mapEmpreendedorService.create(dto);
  }

  @Get('dashboard/dados')
  @Roles('Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  getDashboard(@Request() req): Promise<any> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.mapEmpreendedorService.getDashboardDados(usuarioId);
  }

  @Get('perfil/me')
  @Roles('Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req): Promise<Empreendedor> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.mapEmpreendedorService.findByUsuarioId(usuarioId);
  }

  @Put(':id')
  @Roles('Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateEmpreendedorDto
  ): Promise<Empreendedor> {
    return this.mapEmpreendedorService.update(id, dto);
  }

  @Put('demandas/:demIntId/reativar')
  @Roles('Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reativar uma demanda arquivada, enviando-a novamente para a triagem' })
  reativarDemanda(
    @Param('demIntId', ParseIntPipe) demIntId: number,
    @Request() req
  ): Promise<Demanda> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.mapEmpreendedorService.reativarDemanda(demIntId, usuarioId);
  }

  @Put('suspender/:id')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  suspender(@Param('id', ParseIntPipe) id: number): Promise<Empreendedor> {
    return this.mapEmpreendedorService.suspender(id);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mapEmpreendedorService.delete(id);
  }
}