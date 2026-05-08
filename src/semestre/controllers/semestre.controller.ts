import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SemestreService } from '../services/semestre.service';
import { Semestre } from '../entities/semestre.entity';

@Controller('/semestres')
export class SemestreController {
  constructor(private readonly semestreService: SemestreService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Semestre[]> {
    return this.semestreService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Semestre | null> {
    return this.semestreService.findById(id);
  }

  @Get('/grupos')
  findComGrupos(@Query('ids') ids: string) {
    const idsArray = ids.split(',').map(Number);

    return this.semestreService.findComGrupos(idsArray);
  }

  @Get('/demandas')
  findComDemandas(@Query('ids') ids: string) {
    const idsArray = ids.split(',').map(Number);

    return this.semestreService.findComDemandas(idsArray);
  }
}
