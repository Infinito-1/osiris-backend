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
import { HistoricoProjetoService } from '../services/historico_projeto.service';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';

@Controller('/historicos-projeto')
export class HistoricoProjetoController {
  constructor(
    private readonly historicoProjetoService: HistoricoProjetoService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findById(id);
  }

  @Get('/descricao/:descricao')
  @HttpCode(HttpStatus.OK)
  findByDescricao(
    @Param('descricao') descricao: string,
  ): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findByDescricao(descricao);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() historico: HistoricoProjeto): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.create(historico);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() historico: HistoricoProjeto): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.update(historico);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.historicoProjetoService.delete(id);
  }
}
