/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CoordenadorService } from '../services/coordenador.service';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';
import { ClassificarDemandaDto } from '../dto/classificar-demanda.dto';
import { GerenciarCandidaturaDto } from '../dto/gerenciar-candidatura.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RejeitarDemandaDto } from '../dto/rejeitar-demanda';
import { Coordenador } from '../entities/coordenador.entity';

@ApiTags('Coordenador')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coordenadores')
export class CoordenadorController {
  constructor(private readonly coordenadorService: CoordenadorService) {}

  @Get()
  @Roles('Admin', 'Coordenador')
  @ApiOperation({ summary: 'Listar todos os coordenadores registrados' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.coordenadorService.findAll();
  }

  @Get('dashboard')
  @Roles('Coordenador')
  @ApiOperation({
    summary: 'Obter métricas consolidada do painel do Coordenador logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do dashboard gerados com sucesso.',
  })
  getDashboard(@Req() req: any) {
    // Captura o ID do usuário diretamente do token JWT extraído pelo Passport
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.coordenadorService.getDashboardDados(usuarioId);
  }

  @Get('perfil/me')
  @Roles('Coordenador', 'Admin')
  getPerfil(@Req() req: any): Promise<Coordenador> {
    const usuarioId = req.user.id || req.user.usuIntId;
    return this.coordenadorService.findByUsuarioId(usuarioId);
  }

  @Get(':id')
  @Roles('Admin', 'Coordenador')
  @ApiOperation({ summary: 'Buscar perfil de coordenador pelo ID incremental' })
  @ApiResponse({ status: 200, description: 'Coordenador encontrado.' })
  @ApiResponse({ status: 404, description: 'Coordenador não encontrado.' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.findById(id);
  }

  @Post()
  @Roles('Admin')
  @ApiOperation({
    summary:
      'Vincular um novo perfil de Coordenador a um usuário base (Apenas Admin)',
  })
  @ApiResponse({
    status: 21,
    description: 'Perfil criado e papel de usuário atualizado.',
  })
  create(@Body() dto: CreateCoordenadorDto) {
    return this.coordenadorService.create(dto);
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Atualizar dados cadastrais do coordenador (Apenas Admin)',
  })
  @ApiResponse({ status: 200, description: 'Dados atualizados com sucesso.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoordenadorDto,
  ) {
    return this.coordenadorService.update(id, dto);
  }

  @Put(':id/inativar')
  @Roles('Admin')
  @ApiOperation({
    summary:
      'Inativar a conta de um coordenador bloqueando o acesso dele (Apenas Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Coordenador e usuário base desativados.',
  })
  inativar(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.inativar(id);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Remover o registro de coordenação do banco de dados (Apenas Admin)',
  })
  @ApiResponse({ status: 24, description: 'Registro excluído com sucesso.' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.coordenadorService.delete(id);
  }

  @Put('demanda/:id/classificar')
  @Roles('Coordenador')
  @ApiOperation({
    summary:
      'Definir semestre recomendado e área técnica de uma demanda (RN-02)',
  })
  @ApiResponse({
    status: 200,
    description: 'Demanda classificada com sucesso.',
  })
  classificarDemanda(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClassificarDemandaDto,
  ) {
    return this.coordenadorService.classificarDemanda(id, dto);
  }

  @Put('demanda/:id/aprovar')
  @Roles('Coordenador')
  @ApiOperation({
    summary:
      'Aprovar demanda classificada e disponibilizá-la na galeria pública (RN-02/RN-15)',
  })
  @ApiResponse({
    status: 200,
    description: 'Demanda aprovada e e-mail enviado ao empreendedor.',
  })
  @ApiResponse({
    status: 400,
    description: 'Aprovação negada: demanda não classificada.',
  })
  aprovarDemanda(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const atorEmail = req.user?.email ?? 'coordenador';
    return this.coordenadorService.aprovarDemanda(id, atorEmail);
  }

  @Put('demanda/:id/rejeitar')
  @Roles('Coordenador')
  rejeitarDemanda(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejeitarDemandaDto,
    @Req() req: any,
  ) {
    const atorEmail = req.user?.email ?? 'coordenador';
    return this.coordenadorService.rejeitarDemanda(id, atorEmail, dto.motivo);
  }

  @Put('candidaturas/gerenciar')
  @Roles('Coordenador')
  @ApiOperation({
    summary:
      'Aceitar ou Recusar a candidatura de um grupo estudantil para um projeto (RN-06/RN-15)',
  })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado e e-mail enviado ao líder do grupo.',
  })
  gerenciarCandidaturas(@Body() dto: GerenciarCandidaturaDto, @Req() req: any) {
    const atorEmail = req.user?.email ?? 'coordenador';
    return this.coordenadorService.gerenciarCandidaturas(dto, atorEmail);
  }
}
