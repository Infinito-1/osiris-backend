import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttphspStrStatus,
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
  @HttpCode(HttphspStrStatus.OK)
  findAll(): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttphspStrStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findById(id);
  }

  @Get('/hspStrDesc/:hspStrDesc')
  @HttpCode(HttphspStrStatus.OK)
  findByhspStrDesc(
    @Param('hspStrDesc') hspStrDesc: string,
  ): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoService.findByhspStrDesc(hspStrDesc);
  }

  @Post()
  @HttpCode(HttphspStrStatus.CREATED)
  create(@Body() historico: HistoricoProjeto): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.create(historico);
  }

  @Put()
  @HttpCode(HttphspStrStatus.OK)
  update(@Body() historico: HistoricoProjeto): Promise<HistoricoProjeto> {
    return this.historicoProjetoService.update(historico);
  }

  @Delete('/:id')
  @HttpCode(HttphspStrStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.historicoProjetoService.delete(id);
  }
}
