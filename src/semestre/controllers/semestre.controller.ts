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
import { SemestreService } from '../services/semestre.service';
import { Semestre } from '../entities/semestre.entity';

@Controller('/semestres')
export class SemestreController {
  constructor(private readonly semestreService: SemestreService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Semestre[]> {
    //importar
    return this.semestreService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Semestre | null> {
    return this.semestreService.findById(id);
  }

}
