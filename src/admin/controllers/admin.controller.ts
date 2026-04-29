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
import { AdminService } from '../services/admin.service';
import { Usuario } from '../usuario/entities/usuario.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('candidaturas')
  @HttpCode(HttpStatus.OK)
  getAllCandidaturas() {
    return this.adminService.getAllCandidaturas();
  }

  @Get('candidaturas/:id')
  @HttpCode(HttpStatus.OK)
  getCandidaturaById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCandidaturaById(id);
  }

  @Get('candidaturas/status/:status')
  @HttpCode(HttpStatus.OK)
  getCandidaturasByStatus(@Param('status') status: string) {
    return this.adminService.getCandidaturasByStatus(status);
  }

  @Get('candidaturas/grupo/:grupoId')
  @HttpCode(HttpStatus.OK)
  getCandidaturasByGrupo(@Param('grupoId', ParseIntPipe) grupoId: number) {
    return this.adminService.getCandidaturasByGrupo(grupoId);
  }

  @Put('candidaturas/:id/desativar')
  @HttpCode(HttpStatus.OK)
  desativarCandidatura(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.desativarCandidatura(id);
  }

  @Put('candidaturas/:id/ativar')
  @HttpCode(HttpStatus.OK)
  ativarCandidatura(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.ativarCandidatura(id);
  }

  @Put('candidaturas/:id/status')
  @HttpCode(HttpStatus.OK)
  toggleCandidaturaStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { novoStatus: string },
  ) {
    return this.adminService.toggleCandidaturaStatus(id, body.novoStatus);
  }

  @Get('usuarios')
  @HttpCode(HttpStatus.OK)
  getAllUsuarios(): Promise<Usuario[]> {
    return this.adminService.getAllUsuarios();
  }

  @Get('usuarios/:id')
  @HttpCode(HttpStatus.OK)
  getUsuarioById(@Param('id', ParseIntPipe) id: number): Promise<Usuario | null> {
    return this.adminService.getUsuarioById(id);
  }

  @Get('usuarios/tipo/:tipo')
  @HttpCode(HttpStatus.OK)
  getUsuariosByTipo(
    @Param('tipo')
    tipo: 'Empreendedor' | 'Coordenador' | 'Grupo' | 'Admin',
  ): Promise<Usuario[]> {
    return this.adminService.getUsuariosByTipo(tipo);
  }

  @Put('usuarios/:id')
  @HttpCode(HttpStatus.OK)
  updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosAtualizacao: Partial<Usuario>,
  ): Promise<Usuario | null> {
    return this.adminService.updateUsuario(id, dadosAtualizacao);
  }

  @Delete('usuarios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  desativarUsuario(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.desativarUsuario(id);
  }

  @Put('usuarios/:id/promover')
  @HttpCode(HttpStatus.OK)
  promoverParaAdmin(@Param('id', ParseIntPipe) id: number): Promise<Usuario | null> {
    return this.adminService.promoverParaAdmin(id);
  }

  @Put('usuarios/:id/remover-admin')
  @HttpCode(HttpStatus.OK)
  removerAdminPrivilegios(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Usuario | null> {
    return this.adminService.removerAdminPrivilegios(id);
  }

  @Get('estatisticas')
  @HttpCode(HttpStatus.OK)
  getEstatisticas() {
    return this.adminService.getEstatisticas();
  }
}
