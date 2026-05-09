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
  Query,
  UseGuards,
} from '@nestjs/common';
import { DemandaService } from '../services/demanda.service';
import { Demanda } from '../entities/demanda.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateDemandaDto } from '../dto/create-demanda.dto';
import { UpdateDemandaDto } from '../dto/update-demanda.dto';

// Swagger decorators
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Demandas')
@ApiBearerAuth()
@Controller('demandas')
export class DemandaController {
  constructor(private readonly demandaService: DemandaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todas as demandas' })
  findAll(): Promise<Demanda[]> {
    return this.demandaService.findAll();
  }

  @Get('ordenado')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todas as demandas ordenadas por data' })
  findAllOrdenado(
    @Query('ordem') ordem: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Demanda[]> {
    return this.demandaService.findAllData(ordem);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca uma demanda pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Demanda | null> {
    return this.demandaService.findById(id);
  }

  @Get('nome/:nome')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca demandas pelo nome' })
  findByNome(@Param('nome') nome: string): Promise<Demanda[]> {
    return this.demandaService.findByNome(nome);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria uma nova demanda' })
  create(@Body() dto: CreateDemandaDto): Promise<Demanda> {
    return this.demandaService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('desativar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Desativa uma demanda existente' })
  desativar(@Param('id', ParseIntPipe) id: number): Promise<Demanda> {
    return this.demandaService.desativar(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza uma demanda existente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDemandaDto,
  ): Promise<Demanda | null> {
    return this.demandaService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Remove uma demanda' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.demandaService.delete(id);
  }
}
