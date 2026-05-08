import { Controller, Post, Body, Delete, Param, Get, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  criarAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.criarAdmin(dto.usuarioId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  removerAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removerAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('usuario/:id')
  excluirUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.excluirUsuario(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Put('demanda/:id')
  gerenciarDemanda(@Param('id', ParseIntPipe) id: number, @Body() dados: any) {
    return this.adminService.gerenciarDemanda(id, dados);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete('projeto/:id')
  excluirProjeto(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.excluirProjeto(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get()
  listarAdmins() {
    return this.adminService.listarAdmins();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('estatisticas')
  getEstatisticas() {
    return this.adminService.getEstatisticas();
  }
}
