/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Projeto } from '../../projeto/entities/projeto.entity';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { UpdatePapelDto } from '../dto/update-papel.dto';
import { UpdateDemandaDto } from '../../demanda/dto/update-demanda.dto';
import { MailService } from '../../mail/mail.service';
import { LogService } from '../../log/services/log.service';
import { LogAcao } from '../../log/entities/log-acao.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { CoordenadorService } from '../../coordenador/services/coordenador.service';
import { GrupoService } from '../../grupo/services/grupo.service';
import { EmpreendedorService } from '../../empreendedor/services/empreendedor.service';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Projeto)
    private readonly projetoRepository: Repository<Projeto>,
    private readonly logService: LogService,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
    private readonly coordenadorService: CoordenadorService,
    private readonly grupoService: GrupoService,
    private readonly empreendedorService: EmpreendedorService,
    private readonly usuarioService: UsuarioService,
    private readonly mailService: MailService, // Injetado para cumprir RF-20 e RN-15
  ) {}

  private async registrarAuditoria(
    acao: string,
    entidade: string,
    entidadeId: number,
    snapshot: object,
    atorEmail: string,
    destinatarioEmail?: string,
    mensagem?: string,
  ): Promise<void> {
    await this.logService.registrar(
      acao,
      `Admin (${atorEmail}) realizou: ${acao} em ${entidade} ID=${entidadeId}`,
      { tipo: 'Admin', email: atorEmail },
      {
        entidade,
        entidadeId,
        dadosAnteriores: snapshot,
        destinatarioEmail,
        mensagemNotificacao: mensagem,
      },
    );

    // TODO: ativar quando email estiver configurado para notificações de ações:
    // if (destinatarioEmail && mensagemNotificacao) {
    //   await this.mailService.sendGenericEmail(destinatarioEmail, 'Alteração na plataforma Osiris', mensagemNotificacao);
    //   log.logBoolEmailEnviado = true;
    //   log.logDateEmailEnviado = new Date();
    //   await this.logRepository.save(log);
    // }
  }

  private async notificarAlteracao(emailDestino: string, mensagem: string) {
    const notificacao = { emailDestino, mensagem, data: new Date().toISOString() };
    this.notificationsLogs.push(notificacao);
    console.log(`[NOTIFICAÇÃO] Para: ${emailDestino} - ${mensagem}`);
    
    try {
      // CORRIGIDO: Passando 'ADMIN' como primeira entidade
      await this.mailService.sendConfirmationEmail('ADMIN', emailDestino, `Notificação Osiris: ${mensagem}`);
    } catch (error) {
      console.error(`Falha ao disparar e-mail de notificação para ${emailDestino}:`, error);
    }
  }

  async criarAdmin(dto: CreateAdminDto): Promise<Admin> {
    const { usuarioId } = dto;

    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: usuarioId },
    });
    if (!usuario)
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    const adminExistente = await this.adminRepository.findOne({
      where: { usuario: { usuIntId: usuarioId } },
    });
    if (adminExistente) {
      if (!adminExistente.admBoolAtivo) {
        throw new HttpException(
          'Este usuário já possui registro de Admin inativo. Use a rota de reativação.',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Este usuário já é um administrador ativo',
        HttpStatus.CONFLICT,
      );
    }

    usuario.usuStrTipo = 'Admin';
    usuario.usuBoolAtivo = true;
    await this.usuarioRepository.save(usuario);

    const admin = this.adminRepository.create({ usuario, admBoolAtivo: true });
    const novoAdmin = await this.adminRepository.save(admin);

    await this.registrarAuditoria(
      'Criar Admin',
      'Usuario',
      usuarioId,
      { usuIntId: usuario.usuIntId, usuStrEmail: usuario.usuStrEmail },
      usuario.usuStrEmail,
      usuario.usuStrEmail,
      'Sua conta foi promovida ao papel de Administrador no ecossistema Osiris.',
    );

    return novoAdmin;
  }

  async updateAdmin(
    id: number,
    dto: UpdateAdminDto,
    atorEmail: string,
  ): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { admIntId: id },
      relations: ['usuario'],
    });
    if (!admin)
      throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    const snapshot = {
      admIntId: admin.admIntId,
      admBoolAtivo: admin.admBoolAtivo,
    };

    if (dto.admBolAtivo !== undefined) {
      admin.admBoolAtivo = dto.admBolAtivo;
      if (admin.usuario) {
        admin.usuario.usuBoolAtivo = dto.admBolAtivo;
        await this.usuarioRepository.save(admin.usuario);
      }
    }

    const adminAtualizado = await this.adminRepository.save(admin);

    await this.registrarAuditoria(
      'Atualizar Admin',
      'Admin',
      id,
      snapshot,
      atorEmail,
    );

    return adminAtualizado;
  }

  async atualizarPapel(
    usuarioId: number,
    dto: UpdatePapelDto,
    atorEmail: string,
  ): Promise<Usuario> {
    const { novoPapel } = dto;

    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: usuarioId },
    });
    if (!usuario)
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    if (novoPapel === 'Grupo') {
      const emailInstitucionalRegex =
        /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
      if (!emailInstitucionalRegex.test(usuario.usuStrEmail)) {
        throw new HttpException(
          'O usuário não possui e-mail institucional CPS válido para se tornar perfil Grupo.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (usuario.usuStrTipo === 'Admin') {
      const adminReg = await this.adminRepository.findOne({
        where: { usuario: { usuIntId: usuarioId } },
      });
      if (adminReg) await this.adminRepository.delete(adminReg.admIntId);
    }

    const snapshot = {
      usuIntId: usuario.usuIntId,
      usuStrTipo: usuario.usuStrTipo,
      usuStrEmail: usuario.usuStrEmail,
    };
    usuario.usuStrTipo = novoPapel;
    const atualizado = await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria(
      'Atualizar Papel',
      'Usuario',
      usuarioId,
      snapshot,
      atorEmail,
      usuario.usuStrEmail,
      `O perfil da sua conta foi modificado administrativamente para ${novoPapel}.`,
    );

    return atualizado;
  }

  async inativarAdmin(
    id: number,
    usuarioLogadoId: number,
    atorEmail: string,
  ): Promise<void> {
    const admin = await this.adminRepository.findOne({
      where: { admIntId: id },
      relations: ['usuario'],
    });
    if (!admin)
      throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    if (admin.usuario?.usuIntId === usuarioLogadoId) {
      throw new HttpException(
        'Não é permitido inativar a própria conta de administrador',
        HttpStatus.FORBIDDEN,
      );
    }

    const adminsAtivos = await this.adminRepository.count({
      where: { admBoolAtivo: true },
    });
    if (adminsAtivos <= 1 && admin.admBoolAtivo) {
      throw new HttpException(
        'Não é permitido remover o único administrador ativo do sistema',
        HttpStatus.FORBIDDEN,
      );
    }

    const snapshot = {
      admIntId: admin.admIntId,
      usuStrEmail: admin.usuario?.usuStrEmail,
    };

    admin.admBoolAtivo = false;
    await this.adminRepository.save(admin);

    if (admin.usuario) {
      admin.usuario.usuBoolAtivo = false;
      await this.usuarioRepository.save(admin.usuario);
    }

    await this.registrarAuditoria(
      'Inativar Admin',
      'Admin',
      id,
      snapshot,
      atorEmail,
      admin.usuario?.usuStrEmail,
      'Sua credencial administrativa e acesso à plataforma foram desativados.',
    );
  }

  async reativarAdmin(id: number, atorEmail: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { admIntId: id },
      relations: ['usuario'],
    });
    if (!admin)
      throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    admin.admBoolAtivo = true;
    await this.adminRepository.save(admin);

    if (admin.usuario) {
      admin.usuario.usuBoolAtivo = true;
      admin.usuario.usuStrTipo = 'Admin';
      await this.usuarioRepository.save(admin.usuario);
    }

    await this.registrarAuditoria(
      'Reativar Admin',
      'Admin',
      id,
      { admIntId: admin.admIntId },
      atorEmail,
      admin.usuario?.usuStrEmail,
      'Seu acesso de administrador à plataforma Osiris foi restabelecido.',
    );

    return admin;
  }

  async inativarUsuario(id: number, atorEmail: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: id },
    });
    if (!usuario)
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    if (usuario.usuStrTipo === 'Admin') {
      throw new HttpException(
        'Não é permitido inativar administradores por esta rota.',
        HttpStatus.FORBIDDEN,
      );
    }

    const snapshot = {
      usuIntId: usuario.usuIntId,
      usuStrNome: usuario.usuStrNome,
      usuStrEmail: usuario.usuStrEmail,
      usuStrTipo: usuario.usuStrTipo,
    };

    usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria(
      'Inativar Usuário',
      'Usuario',
      id,
      snapshot,
      atorEmail,
      usuario.usuStrEmail,
      'Sua conta na plataforma Osiris foi desativada pela administração.',
    );
  }

  async reativarUsuario(id: number, atorEmail: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: id },
    });
    if (!usuario)
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    usuario.usuBoolAtivo = true;
    await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria(
      'Reativar Usuário',
      'Usuario',
      id,
      { usuIntId: usuario.usuIntId, usuStrEmail: usuario.usuStrEmail },
      atorEmail,
      usuario.usuStrEmail,
      'Sua conta na plataforma Osiris foi reativada. Você já pode efetuar login novamente.',
    );

    return usuario;
  }

  async gerenciarDemanda(
    id: number,
    dados: UpdateDemandaDto,
    atorEmail: string,
  ): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId: id },
      relations: ['empreendedor', 'empreendedor.usuario'],
    });
    if (!demanda)
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    const snapshot = {
      demIntId: demanda.demIntId,
      demStrNome: demanda.demStrNome,
    };

    Object.assign(demanda, dados);
    const atualizada = await this.demandaRepository.save(demanda);

    await this.registrarAuditoria(
      'Editar Demanda',
      'Demanda',
      id,
      snapshot,
      atorEmail,
      demanda.empreendedor?.usuario?.usuStrEmail,
      `A demanda "${demanda.demStrNome}" foi editada por um administrador.`,
    );

    return atualizada;
  }

  async moderarEOmitirDemanda(
    id: number,
    parecerTecnico: string,
    atorEmail: string,
  ): Promise<Demanda> {
    if (!parecerTecnico?.trim()) {
      throw new HttpException(
        'Parecer técnico obrigatório.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const demanda = await this.demandaRepository.findOne({
      where: { demIntId: id },
      relations: ['empreendedor', 'empreendedor.usuario'],
    });
    if (!demanda)
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    const snapshot = {
      demIntId: demanda.demIntId,
      demStrNome: demanda.demStrNome,
    };

    demanda.demBoolAtivo = false;
    const moderada = await this.demandaRepository.save(demanda);

    await this.registrarAuditoria(
      'Moderar Demanda',
      'Demanda',
      id,
      snapshot,
      atorEmail,
      demanda.empreendedor?.usuario?.usuStrEmail,
      `A demanda "${demanda.demStrNome}" foi suspensa. Motivo: ${parecerTecnico}`,
    );

    return moderada;
  }

  async inativarProjeto(id: number, atorEmail: string): Promise<void> {
    const projeto = await this.projetoRepository.findOne({
      where: { proIntId: id },
      relations: [
        'candidatura',
        'candidatura.grupo',
        'candidatura.grupo.usuario',
        'grupo',
        'grupo.usuario',
      ],
    });
    if (!projeto)
      throw new HttpException('Projeto não encontrado', HttpStatus.NOT_FOUND);

    const usuarioEmail =
      projeto.candidatura?.grupo?.usuario?.usuStrEmail ??
      projeto.grupo?.usuario?.usuStrEmail ??
      undefined;

    const snapshot = {
      proIntId: projeto.proIntId,
      proStrDescricao: projeto.proStrDescricao,
    };

    projeto.proBoolAtivo = false;
    await this.projetoRepository.save(projeto);

    await this.registrarAuditoria(
      'Inativar Projeto',
      'Projeto',
      id,
      snapshot,
      atorEmail,
      usuarioEmail,
      `O projeto "${projeto.proStrDescricao}" foi inativado por um administrador.`,
    );
  }

  async reativarDemanda(id: number, atorEmail: string): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId: id },
      relations: ['empreendedor', 'empreendedor.usuario'],
    });
    if (!demanda)
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    demanda.demBoolAtivo = true;
    await this.demandaRepository.save(demanda);

    await this.registrarAuditoria(
      'Reativar Demanda',
      'Demanda',
      id,
      { demIntId: demanda.demIntId, demStrNome: demanda.demStrNome },
      atorEmail,
      demanda.empreendedor?.usuario?.usuStrEmail,
      `A demanda "${demanda.demStrNome}" foi reativada.`,
    );

    return demanda;
  }

  async reativarProjeto(id: number, atorEmail: string): Promise<Projeto> {
    const projeto = await this.projetoRepository.findOne({
      where: { proIntId: id },
      relations: [
        'candidatura',
        'candidatura.grupo',
        'candidatura.grupo.usuario',
        'grupo',
        'grupo.usuario',
      ],
    });
    if (!projeto)
      throw new HttpException('Projeto não encontrado', HttpStatus.NOT_FOUND);

    const usuarioEmail =
      projeto.candidatura?.grupo?.usuario?.usuStrEmail ??
      projeto.grupo?.usuario?.usuStrEmail ??
      undefined;

    projeto.proBoolAtivo = true;
    await this.projetoRepository.save(projeto);

    await this.registrarAuditoria(
      'Reativar Projeto',
      'Projeto',
      id,
      { proIntId: projeto.proIntId, proStrDescricao: projeto.proStrDescricao },
      atorEmail,
      usuarioEmail,
      `O projeto "${projeto.proStrDescricao}" foi reativado.`,
    );

    return projeto;
  }

  async listarAdmins(): Promise<Admin[]> {
    return this.adminRepository.find({ relations: ['usuario'] });
  }

  async listarAuditoria(): Promise<LogAcao[]> {
    return this.logService.listar();
  }

  async getEstatisticas(): Promise<any> {
    const totalUsuarios = await this.usuarioRepository.count();
    const totalDemandas = await this.demandaRepository.count();
    const totalProjetos = await this.projetoRepository.count();
    const totalAdmins = await this.adminRepository.count();

    const porTipo = await this.usuarioRepository
      .createQueryBuilder('u')
      .select('u.usuStrTipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .groupBy('u.usuStrTipo')
      .getRawMany();

    const usuariosPorTipo = {
      empreendedores: 0,
      coordenadores: 0,
      grupos: 0,
      admins: 0,
    };
    for (const row of porTipo) {
      if (row.tipo === 'Empreendedor')
        usuariosPorTipo.empreendedores = Number(row.total);
      if (row.tipo === 'Coordenador')
        usuariosPorTipo.coordenadores = Number(row.total);
      if (row.tipo === 'Grupo') usuariosPorTipo.grupos = Number(row.total);
      if (row.tipo === 'Admin') usuariosPorTipo.admins = Number(row.total);
    }

    return {
      totalUsuarios,
      totalDemandas,
      totalProjetos,
      totalAdmins,
      usuariosPorTipo,
      timestamp: new Date().toISOString(),
    };
  }

  async excluirDemanda(id: number, atorEmail: string): Promise<void> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId: id },
      relations: ['candidatura', 'empreendedor', 'empreendedor.usuario'],
    });
    if (!demanda)
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    const snapshot = {
      demIntId: demanda.demIntId,
      demStrNome: demanda.demStrNome,
    };

    const candidaturaIds = demanda.candidatura?.map((c) => c.canIntId) ?? [];

    // 1. Desativar projetos vinculados às candidaturas
    if (candidaturaIds.length) {
      await this.projetoRepository
        .createQueryBuilder()
        .update()
        .set({ candidatura: null })
        .where('can_int_id IN (:...ids)', { ids: candidaturaIds })
        .execute();

      // 2. Excluir candidaturas
      await this.candidaturaRepository.delete(candidaturaIds);
    }

    // 3. Excluir demanda
    await this.demandaRepository.delete(id);

    await this.registrarAuditoria(
      'Excluir Demanda',
      'Demanda',
      id,
      snapshot,
      atorEmail,
      demanda.empreendedor?.usuario?.usuStrEmail,
      `A demanda "${demanda.demStrNome}" foi removida da plataforma Osiris.`,
    );
  }

  async excluirCandidatura(id: number, atorEmail: string): Promise<void> {
    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId: id },
      relations: ['demanda', 'grupo', 'grupo.usuario'],
    });
    if (!candidatura)
      throw new HttpException(
        'Candidatura não encontrada',
        HttpStatus.NOT_FOUND,
      );

    const snapshot = {
      canIntId: candidatura.canIntId,
      canStrStatus: candidatura.canStrStatus,
      demStrNome: candidatura.demanda?.demStrNome,
    };

    // Desativar projetos vinculados a esta candidatura
    await this.projetoRepository
      .createQueryBuilder()
      .update()
      .set({ proBoolAtivo: false })
      .where('can_int_id = :id', { id })
      .execute();

    await this.candidaturaRepository.delete(id);

    await this.registrarAuditoria(
      'Excluir Candidatura',
      'Candidatura',
      id,
      snapshot,
      atorEmail,
      candidatura.grupo?.usuario?.usuStrEmail,
      `Sua candidatura para "${candidatura.demanda?.demStrNome}" foi removida por um administrador.`,
    );
  }

  async impactoCandidatura(id: number): Promise<{ totalProjetos: number }> {
    const totalProjetos = await this.projetoRepository.count({
      where: { candidatura: { canIntId: id } },
    });
    return { totalProjetos };
  }

  async criarUsuario(dto: CreateUsuarioDto, atorEmail: string): Promise<any> {
    // 1. Cria o usuário base
    const resultado = await this.usuarioService.create(dto, { role: 'Admin' });
    const usuarioId = resultado.dados.id;
    console.log('[AdminService] dto recebido:', JSON.stringify(dto));
    // 2. Cria o perfil vinculado
    try {
      if (dto.usuStrTipo === 'Coordenador') {
        console.log('[AdminService] Chamando coordenadorService.create com usuarioId:', usuarioId);
        await this.coordenadorService.create({
          usuIntId: usuarioId,
          cooStrCurso: dto.cooStrCurso ?? 'Não informado',
        });
        console.log('[AdminService] Coordenador criado com sucesso');
      } else if (dto.usuStrTipo === 'Empreendedor') {
        await this.empreendedorService.create({
          usuIntId: usuarioId,
          empStrEmpresa: dto.empStrEmpresa ?? 'Não informado',
          empChaCnpj: dto.empChaCnpj ?? '',
        });
      } else if (dto.usuStrTipo === 'Grupo') {
        await this.grupoService.create({
          usuIntId: usuarioId,
          gruStrNome: dto.gruStrNome ?? 'Não informado',
          gruStrDescricao: dto.gruStrDescricao ?? 'Não informado',
          gruChaRa: dto.gruChaRa ?? '0000000000000',
          gruIntTamanho: dto.gruIntTamanho ?? 1,
          gruStrMembros: dto.gruStrMembros,
          semIntId: dto.semIntId ?? 1,
        });
      }
    } catch (err) {
      console.error('[AdminService] Erro ao criar perfil vinculado:', err);
      throw new HttpException(
        `Usuário criado (ID: ${usuarioId}), mas falha ao criar perfil de ${dto.usuStrTipo}: ${(err as any)?.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.registrarAuditoria(
      'Criar Usuário',
      'Usuario',
      usuarioId,
      { usuStrEmail: dto.usuStrEmail, usuStrTipo: dto.usuStrTipo },
      atorEmail,
    );

    return resultado;
  }
}
