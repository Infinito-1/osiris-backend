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

@Injectable()
export class AdminService {
  private auditoriaLogs: any[] = [];
  private notificationsLogs: any[] = [];

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Projeto)
    private readonly projetoRepository: Repository<Projeto>,
    private readonly mailService: MailService,
  ) {}

  private async registrarAuditoria(acao: string, detalhes: string) {
    const registro = { acao, detalhes, data: new Date().toISOString() };
    this.auditoriaLogs.push(registro);
    console.log(`[AUDITORIA] ${acao} - ${detalhes}`);
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

    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: usuarioId } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    const adminExistente = await this.adminRepository.findOne({ where: { usuario: { usuIntId: usuarioId } } });
    if (adminExistente) {
      if (!adminExistente.admBoolAtivo) {
        throw new HttpException('Este usuário já possui registro de Admin inativo. Use a rota de reativação.', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Este usuário já é um administrador ativo', HttpStatus.CONFLICT);
    }

    usuario.usuStrTipo = 'Admin';
    usuario.usuBoolAtivo = true; 
    await this.usuarioRepository.save(usuario);

    const admin = this.adminRepository.create({ usuario, admBoolAtivo: true });
    const novoAdmin = await this.adminRepository.save(admin);

    await this.registrarAuditoria('Criar Admin', `Usuário ID=${usuarioId} promovido a Admin`);
    await this.notificarAlteracao(usuario.usuStrEmail, 'Sua conta foi promovida ao papel de Administrador no ecossistema Osiris.');

    return novoAdmin;
  }

  async updateAdmin(id: number, dto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    if (dto.admBolAtivo !== undefined) {
      admin.admBoolAtivo = dto.admBolAtivo;
      if (admin.usuario) {
        admin.usuario.usuBoolAtivo = dto.admBolAtivo;
        await this.usuarioRepository.save(admin.usuario);
      }
    }

    const adminAtualizado = await this.adminRepository.save(admin);
    await this.registrarAuditoria('Update Admin', `Configurações do Admin ID=${id} atualizadas`);
    return adminAtualizado;
  }

  async atualizarPapel(usuarioId: number, dto: UpdatePapelDto): Promise<Usuario> {
    const { novoPapel } = dto;

    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: usuarioId } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    if (novoPapel === 'Grupo') {
      const emailInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
      if (!emailInstitucionalRegex.test(usuario.usuStrEmail)) {
        throw new HttpException(
          'Incompatibilidade de papel: O usuário alvo não possui um e-mail institucional CPS válido para se tornar um perfil Grupo.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (usuario.usuStrTipo === 'Admin') {
      const adminReg = await this.adminRepository.findOne({ where: { usuario: { usuIntId: usuarioId } } });
      if (adminReg) {
        await this.adminRepository.delete(adminReg.admIntId);
      }
    }

    usuario.usuStrTipo = novoPapel;
    const atualizado = await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria('Atualizar Papel', `Usuário ID=${usuarioId} alterado para papel: ${novoPapel}`);
    await this.notificarAlteracao(usuario.usuStrEmail, `O perfil da sua conta foi modificado administrativamente para ${novoPapel}.`);

    return atualizado;
  }

  async inativarAdmin(id: number, usuarioLogadoId: number): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    if (admin.usuario && admin.usuario.usuIntId === usuarioLogadoId) {
      throw new HttpException('Não é permitido inativar a sua própria conta de administrador', HttpStatus.FORBIDDEN);
    }

    const adminsAtivos = await this.adminRepository.count({ where: { admBoolAtivo: true } });
    if (adminsAtivos <= 1 && admin.admBoolAtivo) {
      throw new HttpException('Não é permitido remover ou inativar o único administrador ativo do sistema', HttpStatus.FORBIDDEN);
    }

    admin.admBoolAtivo = false;
    await this.adminRepository.save(admin);

    if (admin.usuario) {
      admin.usuario.usuBoolAtivo = false;
      await this.usuarioRepository.save(admin.usuario);
    }

    await this.registrarAuditoria('Inativar Admin', `Admin ID=${id} e seu utilizador base foram inativados`);
    if (admin.usuario) {
      await this.notificarAlteracao(admin.usuario.usuStrEmail, 'Sua credencial administrativa e acesso à plataforma foram desativados.');
    }
  }

  async reativarAdmin(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    admin.admBoolAtivo = true;
    await this.adminRepository.save(admin);

    if (admin.usuario) {
      admin.usuario.usuBoolAtivo = true;
      admin.usuario.usuStrTipo = 'Admin'; 
      await this.usuarioRepository.save(admin.usuario);
    }

    await this.registrarAuditoria('Reativar Admin', `Admin ID=${id} reativado com sucesso`);
    if (admin.usuario) {
      await this.notificarAlteracao(admin.usuario.usuStrEmail, 'Seu acesso de administrador à plataforma Osiris foi restabelecido.');
    }

    return admin;
  }

  async inativarUsuario(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: id } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    if (usuario.usuStrTipo === 'Admin') {
      throw new HttpException('Não é permitido inativar administradores através desta rota padrão de usuários', HttpStatus.FORBIDDEN);
    }

    usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria('Inativar Usuário', `Utilizador ID=${id} foi inativado pelo administrador`);
    await this.notificarAlteracao(usuario.usuStrEmail, 'Sua conta na plataforma Osiris foi temporariamente desativada pela administração.');
  }

  async reativarUsuario(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: id } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    usuario.usuBoolAtivo = true;
    await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria('Reativar Usuário', `Utilizador ID=${id} reativado pelo administrador`);
    await this.notificarAlteracao(usuario.usuStrEmail, 'Sua conta na plataforma Osiris foi reativada. Você já pode efetuar login novamente.');

    return usuario;
  }

  // ... restante dos métodos (gerenciarDemanda, etc.) permanecem iguais ...
  async gerenciarDemanda(id: number, dados: UpdateDemandaDto): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    Object.assign(demanda, dados);
    const demandaAtualizada = await this.demandaRepository.save(demanda);

    await this.registrarAuditoria('Gerenciar Demanda', `Demanda ID=${id} atualizada administrativamente`);
    return demandaAtualizada;
  }

  async moderarEOmitirDemanda(id: number, parecerTecnico: string): Promise<Demanda> {
    if (!parecerTecnico || parecerTecnico.trim().length === 0) {
      throw new HttpException('Moderação bloqueada: É obrigatório o preenchimento do parecer técnico justificando a ação', HttpStatus.BAD_REQUEST);
    }

    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda alvo da denúncia não encontrada', HttpStatus.NOT_FOUND);

    demanda.demBoolAtivo = false; 
    const demandaModerada = await this.demandaRepository.save(demanda);

    await this.registrarAuditoria('Moderação de Conteúdo', `Demanda ID=${id} suspensa. Motivo: ${parecerTecnico}`);

    return demandaModerada;
  }

  async inativarProjeto(id: number): Promise<void> {
    const projeto = await this.projetoRepository.findOne({ where: { proIntId: id } });
    if (!projeto) throw new HttpException('Projeto não encontrado', HttpStatus.NOT_FOUND);

    projeto.proBoolAtivo = false;
    await this.projetoRepository.save(projeto);

    await this.registrarAuditoria('Inativar Projeto', `Projeto ID=${id} definido como inativo`);
  }

  async reativarDemanda(id: number): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    demanda.demBoolAtivo = true;
    await this.demandaRepository.save(demanda);

    await this.registrarAuditoria('Reativar Demanda', `Demanda ID=${id} reativada com sucesso`);
    return demanda;
  }

  async reativarProjeto(id: number): Promise<Projeto> {
    const projeto = await this.projetoRepository.findOne({ where: { proIntId: id } });
    if (!projeto) throw new HttpException('Projeto não encontrado', HttpStatus.NOT_FOUND);

    projeto.proBoolAtivo = true;
    await this.projetoRepository.save(projeto);

    await this.registrarAuditoria('Reativar Projeto', `Projeto ID=${id} restaurado`);
    return projeto;
  }

  async listarAdmins(): Promise<Admin[]> {
    return this.adminRepository.find({ relations: ['usuario'] });
  }

  async listarAuditoria(): Promise<any[]> {
    await this.registrarAuditoria('Consultar Logs', 'Administrador visualizou a listagem de Logs Globais');
    return this.auditoriaLogs;
  }

  async listarNotificacoes(): Promise<any[]> {
    return this.notificationsLogs;
  }

  async getEstatisticas(): Promise<any> {
    const totalUsuarios = await this.usuarioRepository.count();
    const totalDemandas = await this.demandaRepository.count();
    const totalProjetos = await this.projetoRepository.count();
    const totalAdmins = await this.adminRepository.count();

    await this.registrarAuditoria('Consultar Estatísticas', 'Administrador emitiu relatório de dados analíticos gerais');

    return {
      totalUsuarios,
      totalDemandas,
      totalProjetos,
      totalAdmins,
      timestamp: new Date().toISOString()
    };
  }
}