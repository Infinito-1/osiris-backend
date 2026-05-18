import {
  Controller, Post, Body, Delete, Param, Get, ParseIntPipe, Put,
  UseGuards, HttpCode, HttpStatus, Req
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateDemandaDto } from '../../demanda/dto/update-demanda.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
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
  @ApiResponse({ status: 204, description: 'Inativa um administrador pelo ID protegendo contra auto-exclusão' })
  removerAdmin(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    // Captura o ID do administrador logado vindo do JwtAuthGuard para validar a Regra de Exceção da UC-21
    const usuarioLogadoId = req.user?.usuIntId || req.user?.id; 
    return this.adminService.inativarAdmin(id, usuarioLogadoId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Put(':id/reativar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Reativa um administrador desativado' })
  reativarAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reativarAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Put('usuario/:id/papel')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Atualiza o papel de um usuário' })
  atualizarPapel(
    @Param('id', ParseIntPipe) id: number,
    @Body('novoPapel') novoPapel: 'Empreendedor' | 'Coordenador' | 'Grupo',
  ) {
    return this.adminService.atualizarPapel(id, novoPapel);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('usuario/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Inativa um usuário pelo ID (Soft Delete)' })
  excluirUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.inativarUsuario(id);
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
  @Put('demanda/:id/moderar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Modera e oculta uma demanda inadequada através de denúncia (UC-24)' })
  moderarDemanda(
    @Param('id', ParseIntPipe) id: number, 
    @Body('parecerTecnico') parecerTecnico: string
  ) {
    return this.adminService.moderarEOmitirDemanda(id, parecerTecnico);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('projeto/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Inativa um projeto pelo ID (Soft Delete)' })
  excluirProjeto(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.inativarProjeto(id);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('auditoria')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista registros de auditoria global' })
  listarAuditoria() {
    return this.adminService.listarAuditoria();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('notificacoes')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Lista notificações enviadas' })
  listarNotificacoes() {
    return this.adminService.listarNotificacoes();
  }
}