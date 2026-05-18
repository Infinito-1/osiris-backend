import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards
} from '@nestjs/common';
import { ProjetoService } from '../services/projeto.service';
import { Projeto } from '../entities/projeto.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateProjetoDto } from '../dto/create-projeto.dto';
import { UpdateProjetoDto } from '../dto/update-projeto.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Projetos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projetos')
export class ProjetoController {
  constructor(private readonly projetoService: ProjetoService) {}

  @Get()
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna a lista de projetos ativos' })
  findAll(): Promise<Projeto[]> {
    return this.projetoService.findAll();
  }

  @Get(':id')
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca os detalhes de um projeto por ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Projeto> {
    return this.projetoService.findById(id);
  }

  @Post()
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria/Inicia um projeto a partir de uma candidatura' })
  create(@Body() dto: CreateProjetoDto): Promise<Projeto> {
    return this.projetoService.create(dto);
  }

  @Put(':id')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza dados cadastrais do projeto' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjetoDto,
  ): Promise<Projeto> {
    return this.projetoService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Inativa logicamente um projeto no sistema' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projetoService.delete(id);
  }
}