/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  ParseIntPipe,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { UpdatePapelDto } from '../dto/update-papel.dto';
import { UpdateDemandaDto } from '../../demanda/dto/update-demanda.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Cria um novo administrador' })
  criarAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.criarAdmin(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Atualiza propriedades cadastrais do administrador',
  })
  updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description:
      'Inativa um administrador pelo ID protegendo contra auto-exclusão',
  })
  removerAdmin(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const usuarioLogadoId = req.user?.id || req.user?.usuIntId;
    return this.adminService.inativarAdmin(id, Number(usuarioLogadoId));
  }

  @Put(':id/reativar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Reativa um administrador desativado',
  })
  reativarAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reativarAdmin(id);
  }

  @Put('usuario/:id/papel')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Atualiza o papel de um usuário comum',
  })
  atualizarPapel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePapelDto,
  ) {
    return this.adminService.atualizarPapel(id, dto);
  }

  @Delete('usuario/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Inativa um usuário padrão pelo ID (Soft Delete)',
  })
  excluirUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.inativarUsuario(id);
  }

  @Put('usuario/:id/reativar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Reativa um usuário comum desativado',
  })
  reativarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reativarUsuario(id);
  }

  @Put('demanda/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Gerencia uma demanda existente' })
  gerenciarDemanda(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: UpdateDemandaDto,
  ) {
    return this.adminService.gerenciarDemanda(id, dados);
  }

  @Put('demanda/:id/moderar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description:
      'Modera e oculta uma demanda inadequada através de denúncia (UC-24)',
  })
  moderarDemanda(
    @Param('id', ParseIntPipe) id: number,
    @Body('parecerTecnico') parecerTecnico: string,
  ) {
    return this.adminService.moderarEOmitirDemanda(id, parecerTecnico);
  }

  @Put('demanda/:id/reativar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Restaura a visualização de uma demanda inativada',
  })
  reativarDemanda(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reativarDemanda(id);
  }

  @Delete('projeto/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Inativa um projeto pelo ID (Soft Delete)',
  })
  excluirProjeto(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.inativarProjeto(id);
  }

  @Put('projeto/:id/reativar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Restaura a atividade operacional de um projeto',
  })
  reativarProjeto(@Param('id', ParseIntPipe) id: number) {
    const ator = { tipo: 'Admin' as const, email: req.user?.email ?? 'admin' };
    return this.adminService.reativarProjeto(id, ator);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Lista todos os administradores cadastrados',
  })
  listarAdmins() {
    return this.adminService.listarAdmins();
  }

  @Get('estatisticas')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Retorna estatísticas gerais de uso do ecossistema',
  })
  getEstatisticas() {
    return this.adminService.getEstatisticas();
  }

  @Get('auditoria')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Lista registros da trilha de auditoria global',
  })
  listarAuditoria() {
    return this.adminService.listarAuditoria();
  }
}
