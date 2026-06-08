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
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private ator(req: any): string {
    return req.user?.email ?? req.user?.username ?? 'admin';
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  criarAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.criarAdmin(dto);
  }

  @Post('usuario')
  @HttpCode(HttpStatus.CREATED)
  criarUsuario(@Body() dto: CreateUsuarioDto, @Req() req: any) {
    return this.adminService.criarUsuario(dto, this.ator(req));
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
    @Req() req: any,
  ) {
    return this.adminService.updateAdmin(id, dto, this.ator(req));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerAdmin(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const usuarioLogadoId = req.user?.id || req.user?.usuIntId;
    return this.adminService.inativarAdmin(
      id,
      Number(usuarioLogadoId),
      this.ator(req),
    );
  }

  @Put(':id/reativar')
  @HttpCode(HttpStatus.OK)
  reativarAdmin(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.reativarAdmin(id, this.ator(req));
  }

  @Put('usuario/:id/papel')
  @HttpCode(HttpStatus.OK)
  atualizarPapel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePapelDto,
    @Req() req: any,
  ) {
    return this.adminService.atualizarPapel(id, dto, this.ator(req));
  }

  @Delete('usuario/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  excluirUsuario(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.inativarUsuario(id, this.ator(req));
  }

  @Put('usuario/:id/reativar')
  @HttpCode(HttpStatus.OK)
  reativarUsuario(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.reativarUsuario(id, this.ator(req));
  }

  @Put('demanda/:id')
  @HttpCode(HttpStatus.OK)
  gerenciarDemanda(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: UpdateDemandaDto,
    @Req() req: any,
  ) {
    return this.adminService.gerenciarDemanda(id, dados, this.ator(req));
  }

  @Put('demanda/:id/moderar')
  @HttpCode(HttpStatus.OK)
  moderarDemanda(
    @Param('id', ParseIntPipe) id: number,
    @Body('parecerTecnico') parecerTecnico: string,
    @Req() req: any,
  ) {
    return this.adminService.moderarEOmitirDemanda(
      id,
      parecerTecnico,
      this.ator(req),
    );
  }

  @Put('demanda/:id/reativar')
  @HttpCode(HttpStatus.OK)
  reativarDemanda(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.reativarDemanda(id, this.ator(req));
  }

  @Delete('projeto/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  excluirProjeto(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.inativarProjeto(id, this.ator(req));
  }

  @Put('projeto/:id/reativar')
  @HttpCode(HttpStatus.OK)
  reativarProjeto(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.reativarProjeto(id, this.ator(req));
  }

  @Delete('demanda/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  excluirDemanda(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.excluirDemanda(id, this.ator(req));
  }

  @Delete('candidatura/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  excluirCandidatura(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.excluirCandidatura(id, this.ator(req));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  listarAdmins() {
    return this.adminService.listarAdmins();
  }

  @Get('estatisticas')
  @HttpCode(HttpStatus.OK)
  getEstatisticas() {
    return this.adminService.getEstatisticas();
  }

  @Get('auditoria')
  @HttpCode(HttpStatus.OK)
  listarAuditoria() {
    return this.adminService.listarAuditoria();
  }

  @Get('candidatura/:id/impacto')
  async impactoCandidatura(@Param('id') id: number) {
    return this.adminService.impactoCandidatura(id);
  }
}
