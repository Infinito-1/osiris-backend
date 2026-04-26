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
import { CandidaturaService } from '../services/candidatura.service';
import { Candidatura } from '../entities/candidatura.entity';

@Controller('/candidaturas')
export class CandidaturaController {
  constructor(private readonly candidaturaService: CandidaturaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Candidatura[]> {
    return this.candidaturaService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Candidatura | null> {
    return this.candidaturaService.findById(id);
  }

  @Get('status/:status')
  @HttpCode(HttpStatus.OK)
  findByStatus(@Param('status') status: string): Promise<Candidatura[]> {
    return this.candidaturaService.findByStatus(status);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() candidatura: Candidatura): Promise<Candidatura> {
    return this.candidaturaService.create(candidatura);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() candidatura: Candidatura): Promise<Candidatura> {
    return this.candidaturaService.update(candidatura);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.candidaturaService.delete(id);
  }
}
