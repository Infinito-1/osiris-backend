import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Projeto } from '../../projeto/entities/projeto.entity';
import { UpdateDemandaDto } from '../../demanda/dto/update-demanda.dto';

@Injectable()
export class AdminService {
  private auditoriaLogs: any[] = [];
  private notificacoes: any[] = [];

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Projeto)
    private readonly projetoRepository: Repository<Projeto>,
  ) {}

  /**
   * UC-22: Registro de Logs de Auditoria Global
   */
  private async registrarAuditoria(acao: string, detalhes: string) {
    const registro = { acao, detalhes, data: new Date().toISOString() };
    this.auditoriaLogs.push(registro);
    console.log(`[AUDITORIA] ${acao} - ${detalhes}`);
  }

  /**
   * RN-15: Sistema de simulação de alertas automatizados por e-mail
   */
  private async notificarAlteracao(mensagem: string) {
    const notificacao = { mensagem, data: new Date().toISOString() };
    this.notificacoes.push(notificacao);
    console.log(`[NOTIFICAÇÃO VIA API EMAIL] ${mensagem}`);
  }

  /**
   * UC-21 / RF-16: Promover um utilizador existente ao papel de Administrador
   */
  async criarAdmin(usuarioId: number): Promise<Admin> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: usuarioId } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    usuario.usuStrTipo = 'Admin';
    await this.usuarioRepository.save(usuario);

    const admin = this.adminRepository.create({ usuario, admBoolAtivo: true });
    const novoAdmin = await this.adminRepository.save(admin);

    await this.registrarAuditoria('Criar Admin', `Usuário ID=${usuarioId} promovido a Admin`);
    await this.notificarAlteracao(`Usuário ${usuario.usuStrEmail} foi promovido a administrador.`);

    return novoAdmin;
  }

  /**
   * UC-21: Inativar Administrador protegendo contra auto-exclusão e travando
   * a remoção do último administrador ativo da plataforma.
   */
  async inativarAdmin(id: number, usuarioLogadoId: number): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    if (admin.usuario.usuIntId === usuarioLogadoId) {
      throw new HttpException('Não é permitido inativar a sua própria conta de administrador', HttpStatus.FORBIDDEN);
    }

    const adminsAtivos = await this.adminRepository.count({ where: { admBoolAtivo: true } });
    if (adminsAtivos <= 1 && admin.admBoolAtivo) {
      throw new HttpException('Não é permitido remover ou inativar o único administrador ativo do sistema', HttpStatus.FORBIDDEN);
    }

    admin.admBoolAtivo = false;
    await this.adminRepository.save(admin);

    admin.usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(admin.usuario);

    await this.registrarAuditoria('Inativar Admin', `Admin ID=${id} e seu utilizador base foram inativados`);
    await this.notificarAlteracao(`Administrador ${admin.usuario.usuStrEmail} foi inativado.`);
  }

  /**
   * UC-21: Reativação de uma credencial de Administrador inativada
   */
  async reativarAdmin(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    admin.admBoolAtivo = true;
    await this.adminRepository.save(admin);

    admin.usuario.usuBoolAtivo = true;
    await this.usuarioRepository.save(admin.usuario);

    await this.registrarAuditoria('Reativar Admin', `Admin ID=${id} reativado com sucesso`);
    await this.notificarAlteracao(`Administrador ${admin.usuario.usuStrEmail} foi reativado.`);

    return admin;
  }

  /**
   * RF-18 / UC-21: Atualizar o tipo de papel e permissões de um Utilizador cadastrado
   */
  async atualizarPapel(usuarioId: number, novoPapel: 'Empreendedor' | 'Coordenador' | 'Grupo'): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: usuarioId } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    usuario.usuStrTipo = novoPapel;
    const atualizado = await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria('Atualizar Papel', `Usuário ID=${usuarioId} alterado para papel: ${novoPapel}`);
    await this.notificarAlteracao(`O perfil do usuário ${usuario.usuStrEmail} foi modificado para ${novoPapel}.`);

    return atualizado;
  }

  /**
   * UC-21 / RF-16: Inativar conta de utilizador padrão (Soft Delete)
   */
  async inativarUsuario(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: id } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    if (usuario.usuStrTipo === 'Admin') {
      throw new HttpException('Não é permitido inativar administradores através desta rota padrão', HttpStatus.FORBIDDEN);
    }

    usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria('Inativar Usuário', `Utilizador ID=${id} foi inativado pelo administrador`);
    await this.notificarAlteracao(`O utilizador ${usuario.usuStrEmail} foi desativado da plataforma.`);
  }

  /**
   * UC-21 / RF-16: Restaurar e reativar a conta de um utilizador padrão
   */
  async reativarUsuario(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: id } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    usuario.usuBoolAtivo = true;
    await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria('Reativar Usuário', `Utilizador ID=${id} reativado pelo administrador`);
    await this.notificarAlteracao(`O utilizador ${usuario.usuStrEmail} teve seu acesso restabelecido.`);

    return usuario;
  }

  /**
   * RF-17: Edição administrativa global de dados de uma demanda
   */
  async gerenciarDemanda(id: number, dados: UpdateDemandaDto): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    Object.assign(demanda, dados);
    const demandaAtualizada = await this.demandaRepository.save(demanda);

    await this.registrarAuditoria('Gerenciar Demanda', `Demanda ID=${id} atualizada administrativamente`);
    await this.notificarAlteracao(`A demanda ID ${id} sofreu alterações de dados por um administrador.`);

    return demandaAtualizada;
  }

  /**
   * UC-24: Fluxo de Moderação de Conteúdo e Denúncias para Conteúdos Inadequados
   */
  async moderarEOmitirDemanda(id: number, parecerTecnico: string): Promise<Demanda> {
    if (!parecerTecnico || parecerTecnico.trim().length === 0) {
      throw new HttpException(
        'Moderação bloqueada: É obrigatório o preenchimento do parecer técnico justificando a ação', 
        HttpStatus.BAD_REQUEST
      );
    }

    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda alvo da denúncia não encontrada', HttpStatus.NOT_FOUND);

    demanda.demBoolAtivo = false; 
    const demandaModerada = await this.demandaRepository.save(demanda);

    await this.registrarAuditoria('Moderação de Conteúdo', `Demanda ID=${id} suspensa. Motivo: ${parecerTecnico}`);
    await this.notificarAlteracao(`Infração de Conteúdo: A demanda ID ${id} foi suspensa para revisão.`);

    return demandaModerada;
  }

  /**
   * RF-17: Inativar a visualização e andamento de um Projeto Acadêmico (Soft Delete)
   */
  async inativarProjeto(id: number): Promise<void> {
    const projeto = await this.projetoRepository.findOne({ where: { proIntId: id } });
    if (!projeto) throw new HttpException('Projeto não encontrado', HttpStatus.NOT_FOUND);

    // Ajustado de proBoolAtivo baseado na coluna injetada na entidade Projeto
    projeto.proBoolAtivo = false;
    await this.projetoRepository.save(projeto);

    await this.registrarAuditoria('Inativar Projeto', `Projeto ID=${id} definido como inativo`);
    await this.notificarAlteracao(`O projeto acadêmico ID ${id} foi inativado.`);
  }

  /**
   * RF-17: Reativar uma demanda inativada de volta à galeria pública
   */
  async reativarDemanda(id: number): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    demanda.demBoolAtivo = true;
    await this.demandaRepository.save(demanda);

    await this.registrarAuditoria('Reativar Demanda', `Demanda ID=${id} reativada com sucesso`);
    await this.notificarAlteracao(`A demanda ID ${id} está ativa e visível novamente.`);

    return demanda;
  }

  /**
   * RF-17: Reativar um projeto inativado de volta ao status operacional
   */
  async reativarProjeto(id: number): Promise<Projeto> {
    const projeto = await this.projetoRepository.findOne({ where: { proIntId: id } });
    if (!projeto) throw new HttpException('Projeto não encontrado', HttpStatus.NOT_FOUND);

    projeto.proBoolAtivo = true;
    await this.projetoRepository.save(projeto);

    await this.registrarAuditoria('Reativar Projeto', `Projeto ID=${id} restaurado`);
    await this.notificarAlteracao(`O projeto ID ${id} foi reativado e integrado ao sistema.`);

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
    return this.notificacoes;
  }

  /**
   * RF-15 / UC-22: Emissão e consulta de dados estatísticos e analíticos
   * Corrigido o nome do método tirando o acento gráfico solicitado pelo compilador.
   */
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