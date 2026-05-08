import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards
} from '@nestjs/common';
import { HistoricoProjetoService } from '../services/historico_projeto.service';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateHistoricoProjetoDto } from '../dto/create-historico-projeto.dto';
import { UpdateHistoricoProjetoDto } from '../dto/update-historico-projeto.dto';

@Controller('/historicos-projeto')
export class HistoricoProjetoController {
  constructor(private readonly historicoProjetoService: HistoricoProjetoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<HistoricoProjeto | null> {
    return this.historicoProjetoService.findById(id);
  }

  @Get('/descricao/:desc')
  @HttpCode(HttpStatus.OK)
  findByhspStrDesc(@Param('desc') desc: string): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findByhspStrDesc(desc);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHistoricoProjetoDto): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoricoProjetoDto,
  ): Promise<HistoricoProjeto | null> {
    return this.historicoProjetoService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.historicoProjetoService.delete(id);
  }
}
