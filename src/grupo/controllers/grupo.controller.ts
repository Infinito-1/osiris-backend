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
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../entities/grupo.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { UpdateGrupoDto } from '../dto/update-grupo.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Grupos')
@Controller('/grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  // 📌 VISUALIZAÇÃO (aberto para todos)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todos os grupos ativos' })
  findAll(): Promise<Grupo[]> {
    return this.grupoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca grupo pelo ID' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Grupo | null> {
    return this.grupoService.findById(id);
  }

  @Get('/nome/:gruStrNome')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Busca grupos pelo nome' })
  findByName(@Param('gruStrNome') grupo: string): Promise<Grupo[]> {
    return this.grupoService.findByName(grupo);
  }

  // CRIAÇÃO (grupo logado ou admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('grupo', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Cria um novo grupo' })
  create(@Body() dto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.create(dto);
  }

  // 📌 ATUALIZAÇÃO DE PERFIL (grupo logado ou admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('grupo', 'admin')
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Atualiza o perfil do grupo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGrupoDto,
  ): Promise<Grupo | null> {
    return this.grupoService.update(id, dto);
  }

  // SUSPENSÃO (grupo logado ou admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('grupo', 'admin')
  @Put('/suspender/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Suspende o grupo (inativo, mas não excluído)' })
  suspender(@Param('id', ParseIntPipe) id: number): Promise<Grupo> {
    return this.grupoService.suspender(id);
  }

  //EXCLUSÃO (somente admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Remove um grupo definitivamente (somente admin)' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.grupoService.delete(id);
  }

  //PERFIL DO GRUPO LOGADO
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('grupo', 'admin')
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Retorna perfil do grupo autenticado' })
  getPerfil(@Request() req) {
    return {
      message: 'Grupo autenticado acessando seu perfil',
      usuario: req.user,
    };
  }
}
