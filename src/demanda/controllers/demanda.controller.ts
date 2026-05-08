import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards
} from '@nestjs/common';
import { DemandaService } from '../services/demanda.service';
import { Demanda } from '../entities/demanda.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateDemandaDto } from '../dto/create-demanda.dto';
import { UpdateDemandaDto } from '../dto/update-demanda.dto';

@Controller('/demandas')
export class DemandaController {
  constructor(private readonly demandaService: DemandaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Demanda[]> {
    return this.demandaService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Demanda | null> {
    return this.demandaService.findById(id);
  }

  @Get('nome/:nome')
  @HttpCode(HttpStatus.OK)
  findByNome(@Param('nome') nome: string): Promise<Demanda[]> {
    return this.demandaService.findByNome(nome);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDemandaDto): Promise<Demanda> {
    return this.demandaService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDemandaDto,
  ): Promise<Demanda | null> {
    return this.demandaService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.demandaService.delete(id);
  }
}
