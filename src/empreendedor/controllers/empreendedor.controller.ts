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
import { CreateEmpreendedorDto } from '../dto/create-empreendedor.dto';
import { UpdateEmpreendedorDto } from '../dto/update-empreendedor.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Empreendedores')
@Controller('empreendedores')
export class EmpreendedorController {
  constructor(private readonly empreendedorService: EmpreendedorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Empreendedor[]> {
    return this.empreendedorService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Empreendedor> {
    return this.empreendedorService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEmpreendedorDto): Promise<Empreendedor> {
    return this.empreendedorService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Empreendedor', 'Admin')
  @ApiBearerAuth()
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  getDashboard(@Request() req): Promise<any> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.empreendedorService.getDashboardDados(usuarioId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Empreendedor', 'Admin')
  @ApiBearerAuth()
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req): Promise<Empreendedor> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.empreendedorService.findByUsuarioId(usuarioId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Empreendedor', 'Admin')
  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateEmpreendedorDto
  ): Promise<Empreendedor> {
    return this.empreendedorService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Empreendedor', 'Admin')
  @ApiBearerAuth()
  @Put('demandas/:demIntId/reativar')
  @HttpCode(HttpStatus.OK)
  reativarDemanda(
    @Param('demIntId', ParseIntPipe) demIntId: number,
    @Request() req
  ): Promise<Demanda> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.empreendedorService.reativarDemanda(demIntId, usuarioId);
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
  @Put('suspender/:id')
  @HttpCode(HttpStatus.OK)
  suspender(@Param('id', ParseIntPipe) id: number): Promise<Empreendedor> {
    return this.empreendedorService.suspender(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empreendedorService.delete(id);
  }
}