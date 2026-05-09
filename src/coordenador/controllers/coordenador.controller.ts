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

// Swagger decorators
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Coordenadores')
@ApiBearerAuth()
@Controller('coordenadores')
export class CoordenadorController {
  constructor(private readonly coordenadorService: CoordenadorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todos os coordenadores' })
  findAll(): Promise<Coordenador[]> {
    return this.coordenadorService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca coordenador pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Coordenador | null> {
    return this.coordenadorService.findById(id);
  }

  @Get('curso/:nomeCurso')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista coordenadores por curso' })
  findByCurso(@Param('nomeCurso') curso: string): Promise<Coordenador[]> {
    return this.coordenadorService.findByCurso(curso);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria um novo coordenador' })
  create(@Body() dto: CreateCoordenadorDto): Promise<Coordenador> {
    return this.coordenadorService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza um coordenador existente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoordenadorDto,
  ): Promise<Coordenador | null> {
    return this.coordenadorService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Remove um coordenador' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coordenadorService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna o perfil do coordenador autenticado' })
  getPerfil(@Request() req): { message: string; usuario: any } {
    return {
      message: 'Usuário autenticado acessando Coordenador',
      usuario: req.user,
    };
  }
}
