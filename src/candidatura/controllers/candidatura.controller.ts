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
  ParseEnumPipe,
} from '@nestjs/common';
import { CandidaturaService } from '../services/candidatura.service';
import { Candidatura } from '../entities/candidatura.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateCandidaturaDto } from '../dto/create-candidatura.dto';
import { UpdateCandidaturaDto } from '../dto/update-candidatura.dto';
import { StatusCandidatura } from '../dto/status.enum';

// 🔑 Swagger decorators
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Candidaturas')
@ApiBearerAuth()
@Controller('candidaturas')
export class CandidaturaController {
  constructor(private readonly candidaturaService: CandidaturaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todas as candidaturas' })
  findAll(): Promise<Candidatura[]> {
    return this.candidaturaService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca uma candidatura pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Candidatura | null> {
    return this.candidaturaService.findById(id);
  }

  @Get('status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista candidaturas por status' })
  findByStatus(
    @Param('status', new ParseEnumPipe(StatusCandidatura)) status: StatusCandidatura,
  ): Promise<Candidatura[]> {
    return this.candidaturaService.findByStatus(status);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria uma nova candidatura' })
  create(@Body() dto: CreateCandidaturaDto): Promise<Candidatura> {
    return this.candidaturaService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza uma candidatura existente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCandidaturaDto,
  ): Promise<Candidatura | null> {
    return this.candidaturaService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Remove uma candidatura' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.candidaturaService.delete(id);
  }
}
