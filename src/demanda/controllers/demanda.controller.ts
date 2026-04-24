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
} from '@nestjs/common';
import { DemandaService } from '../services/demanda.service';
import { Demanda } from '../entities/demanda.entity';

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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() demanda: Demanda): Promise<Demanda> {
    return this.demandaService.create(demanda);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() demanda: Demanda): Promise<Demanda> {
    return this.demandaService.update(demanda);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.demandaService.delete(id);
  }
}
