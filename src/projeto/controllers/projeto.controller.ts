import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ProjetoService } from '../services/projeto.service';
import { Projeto } from '../entities/projeto.entity';

@Controller('projetos')
export class ProjetoController {
  constructor(private readonly projetoService: ProjetoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Projeto[]> {
    return this.projetoService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Projeto | undefined> {
    return this.projetoService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() projeto: Projeto): Promise<Projeto> {
    return this.projetoService.create(projeto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseIntPipe) id: number, @Body() projeto: Projeto): Promise<Projeto | undefined> {
    return this.projetoService.update(id, projeto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projetoService.delete(id);
  }
}
