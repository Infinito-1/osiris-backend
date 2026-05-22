import {
  Controller, Get, HttpCode, HttpStatus, Param,
  ParseIntPipe, Query, UseGuards, HttpException
} from '@nestjs/common';
import { SemestreService } from '../services/semestre.service';
import { Semestre } from '../entities/semestre.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';

@ApiTags('Semestres')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('semestres')
export class SemestreController {
  constructor(private readonly semestreService: SemestreService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna todos os semestres letivos do sistema' })
  findAll(): Promise<Semestre[]> {
    return this.semestreService.findAll();
  }

  @Get('filtro/grupos')
  @Roles('Coordenador', 'Grupo', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'ids', example: '1,2,3', description: 'IDs dos semestres separados por vírgula' })
  findComGrupos(@Query('ids') ids: string) {
    if (!ids || ids.trim() === '') {
      throw new HttpException('A query string "ids" não pode estar vazia.', HttpStatus.BAD_REQUEST);
    }

    const idsArray = ids.split(',').map(id => {
      const parsed = Number(id);
      if (isNaN(parsed)) {
        throw new HttpException(`O identificador "${id}" enviado não é um número válido.`, HttpStatus.BAD_REQUEST);
      }
      return parsed;
    });

    return this.semestreService.findComGrupos(idsArray);
  }

  @Get('filtro/demandas')
  @Roles('Coordenador', 'Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'ids', example: '1,2,3', description: 'IDs dos semestres separados por vírgula' })
  findComDemandas(@Query('ids') ids: string) {
    if (!ids || ids.trim() === '') {
      throw new HttpException('A query string "ids" não pode estar vazia.', HttpStatus.BAD_REQUEST);
    }

    const idsArray = ids.split(',').map(id => {
      const parsed = Number(id);
      if (isNaN(parsed)) {
        throw new HttpException(`O identificador "${id}" enviado não é um número válido.`, HttpStatus.BAD_REQUEST);
      }
      return parsed;
    });

    return this.semestreService.findComDemandas(idsArray);
  }

  @Get(':id')
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca detalhes de um semestre por ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Semestre> {
    return this.semestreService.findById(id);
  }
}