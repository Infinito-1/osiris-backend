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
import { CoordenadorService } from '../services/coordenador.service';
import { Coordenador } from '../entities/coordenador.entity';

@Controller('/coordenadores')
export class CoordenadorController {
  constructor(private readonly coordenadorService: CoordenadorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Coordenador[]> {
    return this.coordenadorService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Coordenador | null> {
    return this.coordenadorService.findById(id);
  }

  @Get('curso/:nomeCurso')
  @HttpCode(HttpStatus.OK)
  findByCurso(@Param('nomeCurso') curso: string): Promise<Coordenador[]> {
    return this.coordenadorService.findByCurso(curso);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() coordenador: Coordenador): Promise<Coordenador> {
    return this.coordenadorService.create(coordenador);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() coordenador: Coordenador): Promise<Coordenador> {
    return this.coordenadorService.update(coordenador);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.delete(id);
  }
}
