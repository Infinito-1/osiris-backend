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
import { GrupoService } from '../services/semestre.service';
import { Grupo } from '../entities/semestre.entity';

@Controller('/grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Grupo[]> {
    //importar
    return this.grupoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Grupo[]> {
    return this.grupoService.findById(id);
  }

  @Get('grupo/:nomeGrupo')
  @HttpCode(HttpStatus.OK)
  findByName(@Param('nomeGrupo') grupo: string): Promise<Grupo[]> {
    return this.grupoService.findByName(grupo);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED) //code 201
  create(@Body() grupo: Grupo): Promise<Grupo> {
    return this.grupoService.create(grupo);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() grupo: Grupo): Promise<Grupo> {
    return this.grupoService.update(grupo);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT) //code 204
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.grupoService.delete(id);
  }
}
