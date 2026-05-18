import {
  Body, Controller, Get, HttpCode, HttpStatus, Param,
  ParseIntPipe, Post, Put, Query, UseGuards, HttpException
} from '@nestjs/common';
import { TipoDemandaService } from '../services/tipo_demanda.services';
import { TipoDemanda } from '../entities/tipo_demanda.entity';
import { CreateTipoDemandaDto } from '../dto/create-tipo-demanda.dto';
import { UpdateTipoDemandaDto } from '../dto/update-tipo-demanda.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tipos de Demanda')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tipos-demanda')
export class TipoDemandaController {
  constructor(private readonly tipoDemandaService: TipoDemandaService) {}

  @Get()
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todos os tipos de demanda disponíveis' })
  findAll(): Promise<TipoDemanda[]> {
    return this.tipoDemandaService.findAll();
  }

  @Get('filtro/demandas')
  @Roles('Coordenador', 'Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'ids', example: '1,2', description: 'IDs dos tipos de demandas separados por vírgula' })
  findComDemandas(@Query('ids') ids: string) {
    if (!ids || ids.trim() === '') {
      throw new HttpException('A query string "ids" não pode estar vazia.', HttpStatus.BAD_REQUEST);
    }

    const idsArray = ids.split(',').map(id => {
      const parsed = Number(id);
      if (isNaN(parsed)) {
        throw new HttpException(`O identificador "${id}" fornecido não é um número válido.`, HttpStatus.BAD_REQUEST);
      }
      return parsed;
    });
    return this.tipoDemandaService.findComDemandas(idsArray);
  }

  @Get('nome/:nome')
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Filtra os tipos de demandas por correspondência no nome' })
  findByName(@Param('nome') nome: string): Promise<TipoDemanda[]> {
    return this.tipoDemandaService.findByName(nome);
  }

  @Get(':id')
  @Roles('Coordenador', 'Empreendedor', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca um tipo de demanda pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<TipoDemanda> {
    return this.tipoDemandaService.findById(id);
  }

  @Post()
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cadastra uma nova categoria de tipo de demanda' })
  create(@Body() dto: CreateTipoDemandaDto): Promise<TipoDemanda> {
    return this.tipoDemandaService.create(dto);
  }

  @Put(':id')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza o nome de um tipo de demanda existente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoDemandaDto,
  ): Promise<TipoDemanda> {
    return this.tipoDemandaService.update(id, dto);
  }
}