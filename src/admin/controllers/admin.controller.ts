import {
  Controller, Post, Body, Delete, Param, Get, ParseIntPipe, Put, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateDemandaDto } from '../../demanda/dto/update-demanda.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

// 🔑 Swagger decorators
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria um novo administrador' })
  criarAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.criarAdmin(dto.usuarioId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Remove um administrador pelo ID' })
  removerAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removerAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('usuario/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Exclui um usuário pelo ID' })
  excluirUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.excluirUsuario(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Put('demanda/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Gerencia uma demanda existente' })
  gerenciarDemanda(@Param('id', ParseIntPipe) id: number, @Body() dados: UpdateDemandaDto) {
    return this.adminService.gerenciarDemanda(id, dados);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('projeto/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Exclui um projeto pelo ID' })
  excluirProjeto(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.excluirProjeto(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista todos os administradores' })
  listarAdmins() {
    return this.adminService.listarAdmins();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('estatisticas')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna estatísticas gerais do sistema' })
  getEstatisticas() {
    return this.adminService.getEstatisticas();
  }
}
