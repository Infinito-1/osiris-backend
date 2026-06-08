/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DemandaService } from '../services/demanda.service';
import { Demanda } from '../entities/demanda.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Public } from '../../auth/public.decorator'; // Importando o novo decorador
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateDemandaDto } from '../dto/create-demanda.dto';
import { UpdateDemandaDto } from '../dto/update-demanda.dto';

@ApiTags('Demandas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 Deixamos a segurança global ativa novamente para a classe toda
@Controller('demandas')
export class DemandaController {
  constructor(private readonly demandaService: DemandaService) {}

  @Public() // 🌍 Abre a exceção: Essa rota ignora os Guards lá de cima e aceita não logados!
  @Get('galeria')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Listar demandas aprovadas e ativas para a vitrine pública (Acesso Livre)',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna a galeria pública filtrada.',
  })
  findGaleria(): Promise<Demanda[]> {
    return this.demandaService.findGaleria();
  }

  // Como a classe está protegida globalmente, as rotas abaixo NÃO precisam repetir os @UseGuards:

  @Get()
  @Roles('Coordenador', 'Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Listar todas as demandas cadastradas (Painel de Triagem Gerencial)',
  })
  findAll(): Promise<Demanda[]> {
    return this.demandaService.findAll();
  }

  @Get('ordenado')
  @Public()
  @HttpCode(HttpStatus.OK)
  findAllOrdenado(
    @Query('ordem') ordem: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Demanda[]> {
    return this.demandaService.findAllData(ordem);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Demanda> {
    return this.demandaService.findById(id);
  }

  @Post()
  @Roles('Empreendedor', 'Admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDemandaDto): Promise<Demanda> {
    return this.demandaService.create(dto);
  }

  @Put(':id')
  @Roles('Coordenador', 'Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDemandaDto,
  ): Promise<Demanda> {
    return this.demandaService.update(id, dto);
  }

  @Put('desativar/:id')
  @Roles('Coordenador', 'Empreendedor', 'Admin')
  @HttpCode(HttpStatus.OK)
  desativar(@Param('id', ParseIntPipe) id: number): Promise<Demanda> {
    return this.demandaService.desativar(id);
  }

  @Delete(':id')
  @Roles('Admin')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.demandaService.delete(id);
  }
}
