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
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmpreendedorService } from '../services/empreendedor.service';
import { Empreendedor } from '../entities/empreendedor.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateEmpreendedorDto } from '../dto/create-empreendedor.dto';
import { UpdateEmpreendedorDto } from '../dto/update-empreendedor.dto';

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
  findById(@Param('id', ParseIntPipe) id: number): Promise<Empreendedor | null> {
    return this.empreendedorService.findById(id);
  }

  @Get('empresa/:nomeEmpresa')
  @HttpCode(HttpStatus.OK)
  findByEmpresa(@Param('nomeEmpresa') empresa: string): Promise<Empreendedor[]> {
    return this.empreendedorService.findByEmpresa(empresa);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEmpreendedorDto): Promise<Empreendedor> {
    return this.empreendedorService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpreendedorDto,
  ): Promise<Empreendedor | null> {
    return this.empreendedorService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.empreendedorService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req) {
    return {
      message: 'Usuário autenticado acessando Empreendedor',
      usuario: req.user,
    };
  }
}
