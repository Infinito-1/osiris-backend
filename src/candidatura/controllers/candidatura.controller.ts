import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards
} from '@nestjs/common';
import { CandidaturaService } from '../services/candidatura.service';
import { Candidatura } from '../entities/candidatura.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateCandidaturaDto } from '../dto/create-candidatura.dto';
import { UpdateCandidaturaDto } from '../dto/update-candidatura.dto';

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

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCandidaturaDto): Promise<Candidatura> {
    return this.candidaturaService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCandidaturaDto,
  ): Promise<Candidatura | null> {
    return this.candidaturaService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.candidaturaService.delete(id);
  }
}
