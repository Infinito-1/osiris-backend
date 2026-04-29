import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
  ) {}

  async getAllCandidaturas(): Promise<Candidatura[]> {
    return this.candidaturaRepository.find({
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async getCandidaturaById(id: number): Promise<Candidatura | null> {
    return this.candidaturaRepository.findOne({
      where: { canIntId: id },
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async toggleCandidaturaStatus(
    id: number,
    novoStatus: string,
  ): Promise<Candidatura> {
    const candidatura = await this.getCandidaturaById(id);

    if (!candidatura) {
      throw new BadRequestException('Candidatura não encontrada');
    }

    candidatura.canStrStatus = novoStatus;
    return this.candidaturaRepository.save(candidatura);
  }

  async desativarCandidatura(id: number): Promise<Candidatura> {
    return this.toggleCandidaturaStatus(id, 'Desativada');
  }

  async ativarCandidatura(id: number): Promise<Candidatura> {
    return this.toggleCandidaturaStatus(id, 'Ativa');
  }

  async getCandidaturasByStatus(status: string): Promise<Candidatura[]> {
    return this.candidaturaRepository.find({
      where: { canStrStatus: status },
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async getCandidaturasByGrupo(grupoId: number): Promise<Candidatura[]> {
    return this.candidaturaRepository.find({
      where: { grupo: { gruIntId: grupoId } },
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async getUsuarioById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { usuIntId: id } });
  }

  async getUsuariosByTipo(
    tipo: 'Empreendedor' | 'Coordenador' | 'Grupo' | 'Admin',
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find({ where: { usuStrTipo: tipo } });
  }

  async updateUsuario(
    id: number,
    dadosAtualizacao: Partial<Usuario>,
  ): Promise<Usuario | null> {
    const usuario = await this.getUsuarioById(id);

    if (!usuario) {
      throw new BadRequestException('Utilizador não encontrado');
    }

    if (dadosAtualizacao.usuStrTipo) {
      delete dadosAtualizacao.usuStrTipo;
    }

    await this.usuarioRepository.update(id, dadosAtualizacao);
    return this.getUsuarioById(id);
  }

  async desativarUsuario(id: number): Promise<void> {
    const usuario = await this.getUsuarioById(id);

    if (!usuario) {
      throw new BadRequestException('Utilizador não encontrado');
    }

    // Impedir que admin desative a si mesmo
    if (usuario.usuStrTipo === 'Admin') {
      throw new BadRequestException(
        'Não é permitido desativar utilizadores administradores',
      );
    }

    await this.usuarioRepository.delete(id);
  }

  async promoverParaAdmin(id: number): Promise<Usuario | null> {
    const usuario = await this.getUsuarioById(id);

    if (!usuario) {
      throw new BadRequestException('Utilizador não encontrado');
    }

    usuario.usuStrTipo = 'Admin';
    return this.usuarioRepository.save(usuario);
  }

  async removerAdminPrivilegios(id: number): Promise<Usuario | null> {
    const usuario = await this.getUsuarioById(id);

    if (!usuario) {
      throw new BadRequestException('Utilizador não encontrado');
    }

    if (usuario.usuStrTipo !== 'Admin') {
      throw new BadRequestException('Utilizador não é administrador');
    }

    const admins = await this.getUsuariosByTipo('Admin');
    if (admins.length === 1) {
      throw new BadRequestException(
        'Não é permitido remover o último administrador',
      );
    }

    usuario.usuStrTipo = 'Coordenador';
    return this.usuarioRepository.save(usuario);
  }

  async getEstatisticas() {
    const totalUsuarios = await this.usuarioRepository.count();
    const totalCandidaturas = await this.candidaturaRepository.count();
    const candidaturasAtivas = await this.candidaturaRepository.count({
      where: { canStrStatus: 'Ativa' },
    });
    const candidaturasDesativadas = await this.candidaturaRepository.count({
      where: { canStrStatus: 'Desativada' },
    });

    const usuariosPorTipo = {
      empreendedores: await this.usuarioRepository.count({
        where: { usuStrTipo: 'Empreendedor' },
      }),
      coordenadores: await this.usuarioRepository.count({
        where: { usuStrTipo: 'Coordenador' },
      }),
      grupos: await this.usuarioRepository.count({
        where: { usuStrTipo: 'Grupo' },
      }),
      admins: await this.usuarioRepository.count({
        where: { usuStrTipo: 'Admin' },
      }),
    };

    return {
      totalUsuarios,
      totalCandidaturas,
      candidaturasAtivas,
      candidaturasDesativadas,
      usuariosPorTipo,
    };
  }
}
