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

  // 🔒 Auditoria
  private async registrarAuditoria(acao: string, detalhes: string) {
    const registro = { acao, detalhes, data: new Date().toISOString() };
    this.auditoriaLogs.push(registro);
    console.log(`[AUDITORIA] ${acao} - ${detalhes}`);
  }

  // 🔔 Notificação
  private async notificarAlteracao(mensagem: string) {
    const notificacao = { mensagem, data: new Date().toISOString() };
    this.notificacoes.push(notificacao);
    console.log(`[NOTIFICAÇÃO] ${mensagem}`);
  }

  async criarAdmin(usuarioId: number): Promise<Admin> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: usuarioId } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    usuario.usuStrTipo = 'Admin';
    await this.usuarioRepository.save(usuario);

    const admin = this.adminRepository.create({ usuario });
    const novoAdmin = await this.adminRepository.save(admin);

    await this.registrarAuditoria('Criar Admin', `Usuário ID=${usuarioId} promovido a Admin`);
    await this.notificarAlteracao(`Usuário ${usuario.usuStrEmail} foi promovido a administrador.`);

    return novoAdmin;
  }

  async removerAdmin(id: number): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    const admins = await this.adminRepository.count({ where: { admBolAtivo: true } });
    if (admins <= 1) throw new HttpException('Não é permitido remover o último administrador', HttpStatus.FORBIDDEN);

    admin.usuario.usuStrTipo = 'Coordenador';
    await this.usuarioRepository.save(admin.usuario);
    await this.adminRepository.delete(id);

    await this.registrarAuditoria('Remover Admin', `Admin ID=${id} removido`);
    await this.notificarAlteracao(`Administrador ${admin.usuario.usuStrEmail} foi removido.`);
  }

  async reativarAdmin(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new HttpException('Admin não encontrado', HttpStatus.NOT_FOUND);

    admin.admBolAtivo = true;
    await this.adminRepository.save(admin);

    await this.registrarAuditoria('Reativar Admin', `Admin ID=${id} reativado`);
    await this.notificarAlteracao(`Administrador ${admin.usuario.usuStrEmail} foi reativado.`);

    return admin;
  }

  async atualizarPapel(usuarioId: number, novoPapel: 'Empreendedor' | 'Coordenador' | 'Grupo'): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: usuarioId } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    usuario.usuStrTipo = novoPapel;
    const atualizado = await this.usuarioRepository.save(usuario);

    await this.registrarAuditoria('Atualizar Papel', `Usuário ID=${usuarioId} alterado para ${novoPapel}`);
    await this.notificarAlteracao(`Usuário ${usuario.usuStrEmail} agora é ${novoPapel}.`);

    return atualizado;
  }

  async excluirUsuario(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: id } });
    if (!usuario) throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    if (usuario.usuStrTipo === 'Admin') {
      throw new HttpException('Não é permitido excluir administradores diretamente', HttpStatus.FORBIDDEN);
    }

    await this.usuarioRepository.delete(id);

    await this.registrarAuditoria('Excluir Usuário', `Usuário ID=${id} excluído`);
    await this.notificarAlteracao(`Usuário ${usuario.usuStrEmail} foi excluído pelo administrador.`);
  }

  async gerenciarDemanda(id: number, dados: UpdateDemandaDto): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    Object.assign(demanda, dados);
    const demandaAtualizada = await this.demandaRepository.save(demanda);

    await this.registrarAuditoria('Gerenciar Demanda', `Demanda ID=${id} atualizada`);
    await this.notificarAlteracao(`Demanda ${id} foi atualizada pelo administrador.`);

    return demandaAtualizada;
  }

  async excluirProjeto(id: number): Promise<void> {
    const projeto = await this.projetoRepository.findOne({ where: { proIntId: id } });
    if (!projeto) throw new HttpException('Projeto não encontrado', HttpStatus.NOT_FOUND);

    await this.projetoRepository.delete(id);

    await this.registrarAuditoria('Excluir Projeto', `Projeto ID=${id} excluído`);
    await this.notificarAlteracao(`Projeto ${id} foi excluído pelo administrador.`);
  }

  async listarAdmins(): Promise<Admin[]> {
    return this.adminRepository.find({ relations: ['usuario'] });
  }

  async listarAuditoria() {
    return this.auditoriaLogs;
  }

  async listarNotificacoes() {
    return this.notificacoes;
  }

  async getEstatisticas() {
    const totalUsuarios = await this.usuarioRepository.count();
    const totalDemandas = await this.demandaRepository.count();
    const totalProjetos = await this.projetoRepository.count();
    const totalAdmins = await this.adminRepository.count();

    await this.registrarAuditoria('Consultar Estatísticas', 'Admin consultou estatísticas gerais');

    return {
      totalUsuarios,
      totalDemandas,
      totalProjetos,
      totalAdmins,
    };
  }
}
