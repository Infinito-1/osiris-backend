import {
  Body,
  Controller,
  // Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TipoDemandaService } from '../services/tipo_demanda.services';
import { TipoDemanda } from '../entities/tipo_demanda.entity';

@Controller('/tipos-demanda')
export class TipoDemandaController {
  constructor(private readonly tipoDemandaService: TipoDemandaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<TipoDemanda[]> {
    return this.tipoDemandaService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<TipoDemanda[]> {
    return this.tipoDemandaService.findById(id);
  }

  @Get('/nome/:nome')
  @HttpCode(HttpStatus.OK)
  findByName(@Param('nome') nome: string): Promise<TipoDemanda[]> {
    return this.tipoDemandaService.findByName(nome);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    return this.tipoDemandaService.create(tipoDemanda);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    return this.tipoDemandaService.update(tipoDemanda);
  }

  // @Delete('/:id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.tipoDemandaService.delete(id);
  // }
}
