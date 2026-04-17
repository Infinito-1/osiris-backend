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
import { EmpreendedorService } from '../services/empreendedor.service';
import { Empreendedor } from '../entities/empreendedor.entity';

@Controller('/empreendedores')
export class EmpreendedorController {
  constructor(private readonly empreendedorService: EmpreendedorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Empreendedor[]> {
    return this.empreendedorService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Empreendedor[]> {
    return this.empreendedorService.findById(id);
  }

  @Get('empresa/:nomeEmpresa')
  @HttpCode(HttpStatus.OK)
  findByEmpresa(@Param('nomeEmpresa') empresa: string): Promise<Empreendedor[]> {
    return this.empreendedorService.findByEmpresa(empresa);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() empreendedor: Empreendedor): Promise<Empreendedor> {
    return this.empreendedorService.create(empreendedor);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() empreendedor: Empreendedor): Promise<Empreendedor> {
    return this.empreendedorService.update(empreendedor);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.empreendedorService.delete(id);
  }
}
