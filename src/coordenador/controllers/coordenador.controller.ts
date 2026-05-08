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
import { CoordenadorService } from '../services/coordenador.service';
import { Coordenador } from '../entities/coordenador.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';

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

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCoordenadorDto): Promise<Coordenador> {
    return this.coordenadorService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoordenadorDto,
  ): Promise<Coordenador | null> {
    return this.coordenadorService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  getPerfil(@Request() req) {
    return {
      message: 'Usuário autenticado acessando Coordenador',
      usuario: req.user,
    };
  }
}
