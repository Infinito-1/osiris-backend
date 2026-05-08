import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Projeto } from '../../projeto/entities/projeto.entity';

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
  ) {}

  async criarAdmin(usuarioId: number): Promise<Admin> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: usuarioId } });
    if (!usuario) throw new BadRequestException('Usuário não encontrado');

    usuario.usuStrTipo = 'Admin';
    await this.usuarioRepository.save(usuario);

    const admin = this.adminRepository.create({ usuario });
    return this.adminRepository.save(admin);
  }

  async removerAdmin(id: number): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { admIntId: id }, relations: ['usuario'] });
    if (!admin) throw new BadRequestException('Admin não encontrado');

    const admins = await this.adminRepository.count({ where: { admBolAtivo: true } });
    if (admins <= 1) throw new BadRequestException('Não é permitido remover o último administrador');

    admin.usuario.usuStrTipo = 'Coordenador';
    await this.usuarioRepository.save(admin.usuario);
    await this.adminRepository.delete(id);
  }

  async excluirUsuario(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: id } });
    if (!usuario) throw new BadRequestException('Usuário não encontrado');

    if (usuario.usuStrTipo === 'Admin') {
      throw new BadRequestException('Não é permitido excluir administradores diretamente');
    }

    await this.usuarioRepository.delete(id);
  }

  async gerenciarDemanda(id: number, dados: Partial<Demanda>): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new BadRequestException('Demanda não encontrada');

    Object.assign(demanda, dados);
    return this.demandaRepository.save(demanda);
  }

  async excluirProjeto(id: number): Promise<void> {
    const projeto = await this.projetoRepository.findOne({ where: { proIntId: id } });
    if (!projeto) throw new BadRequestException('Projeto não encontrado');

    await this.projetoRepository.delete(id);
  }

  async listarAdmins(): Promise<Admin[]> {
    return this.adminRepository.find({ relations: ['usuario'] });
  }

  async getEstatisticas() {
    const totalUsuarios = await this.usuarioRepository.count();
    const totalDemandas = await this.demandaRepository.count();
    const totalProjetos = await this.projetoRepository.count();
    const admins = await this.adminRepository.count();

    return { totalUsuarios, totalDemandas, totalProjetos, admins };
  }
}
