import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards
} from '@nestjs/common';
import { HistoricoProjetoService } from '../services/historico_projeto.service';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateHistoricoProjetoDto } from '../dto/create-historico-projeto.dto';
import { UpdateHistoricoProjetoDto } from '../dto/update-historico-projeto.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Históricos do Projeto')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller('historicos-projeto')
export class HistoricoProjetoController {
  constructor(private readonly historicoProjetoService: HistoricoProjetoService) {}


  @Get()
  @Roles('Admin', 'Coordenador', 'Grupo', 'Empreendedor')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna todos os registros de evolução de projetos' })
  findAll(): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findAll();
  }

 
  @Get(':id')
  @Roles('Admin', 'Coordenador', 'Grupo', 'Empreendedor')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca um registro de histórico pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.findById(id);
  }

  @Get('descricao/:desc')
  @Roles('Admin', 'Coordenador', 'Grupo', 'Empreendedor')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Filtra os históricos por aproximação textual na descrição' })
  findByhspStrDesc(@Param('desc') desc: string): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findByhspStrDesc(desc);
  }


  @Post()
  @Roles('Grupo', 'Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria e anexa uma evolução ao histórico do projeto' })
  create(@Body() dto: CreateHistoricoProjetoDto): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.create(dto);
  }


  @Put(':id')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza propriedades de um registro de histórico' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoricoProjetoDto,
  ): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.update(id, dto);
  }

  
  @Delete(':id')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Remove definitivamente um registro do histórico' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.historicoProjetoService.delete(id);
  }
}