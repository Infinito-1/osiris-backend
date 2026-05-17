import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TipoDemandaService } from '../services/tipo_demanda.services';
import { TipoDemanda } from '../entities/tipo_demanda.entity';
import { CreateTipoDemandaDto } from '../dto/create-tipo-demanda.dto';
import { UpdateTipoDemandaDto } from '../dto/update-tipo-demanda.dto';

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
  findById(@Param('id', ParseIntPipe) id: number): Promise<TipoDemanda | null> {
    return this.tipoDemandaService.findById(id);
  }

  @Get('/nome/:nome')
  @HttpCode(HttpStatus.OK)
  findByName(@Param('nome') nome: string): Promise<TipoDemanda[]> {
    return this.tipoDemandaService.findByName(nome);
  }

  @Get('/demandas')
  findComDemandas(@Query('ids') ids: string) {
    const idsArray = ids.split(',').map(Number);
    return this.tipoDemandaService.findComDemandas(idsArray);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTipoDemandaDto): Promise<TipoDemanda> {
    return this.tipoDemandaService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoDemandaDto,
  ): Promise<TipoDemanda> {
    return this.tipoDemandaService.update(id, dto);
  }
}
