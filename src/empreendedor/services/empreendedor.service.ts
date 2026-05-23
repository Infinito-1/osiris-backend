import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empreendedor } from '../entities/empreendedor.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { CreateEmpreendedorDto } from '../dto/create-empreendedor.dto';
import { UpdateEmpreendedorDto } from '../dto/update-empreendedor.dto';

@Injectable()
export class EmpreendedorService {
  constructor(
    @InjectRepository(Empreendedor)
    private readonly empreendedorRepository: Repository<Empreendedor>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
  ) {}

  async findAll(): Promise<Empreendedor[]> {
    return this.empreendedorRepository.find({ relations: ['usuario'] });
  }

  async findById(id: number): Promise<Empreendedor> {
    const empreendedor = await this.empreendedorRepository.findOne({
      where: { empIntId: id },
      relations: ['usuario'],
    });
    if (!empreendedor) {
      throw new HttpException(
        'Empreendedor corporativo não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }
    return empreendedor;
  }

  async findByUsuarioId(usuarioId: number): Promise<Empreendedor> {
    const empreendedor = await this.empreendedorRepository.findOne({
      where: { usuario: { usuIntId: usuarioId } },
      relations: ['usuario'],
    });
    if (!empreendedor) {
      throw new HttpException(
        'Perfil de empreendedor não vinculado a este usuário.',
        HttpStatus.NOT_FOUND,
      );
    }
    return empreendedor;
  }

  async create(dto: CreateEmpreendedorDto): Promise<Empreendedor> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: dto.usuIntId },
    });
    if (!usuario) {
      throw new HttpException(
        'Usuário de credencial base não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    // Alinha a Role do usuário com o perfil criado no ecossistema
    usuario.usuStrTipo = 'Empreendedor';
    await this.usuarioRepository.save(usuario);

    const empreendedor = this.empreendedorRepository.create({
      empStrEmpresa: dto.empStrEmpresa,
      empChaCnpj: dto.empChaCnpj,
      usuario: usuario,
    });

    return this.empreendedorRepository.save(empreendedor);
  }

  async update(id: number, dto: UpdateEmpreendedorDto): Promise<Empreendedor> {
    const empreendedor = await this.findById(id);

    if (dto.empStrEmpresa) empreendedor.empStrEmpresa = dto.empStrEmpresa;
    if (dto.empChaCnpj) empreendedor.empChaCnpj = dto.empChaCnpj;

    if (dto.usuIntId) {
      const novoUsuario = await this.usuarioRepository.findOne({
        where: { usuIntId: dto.usuIntId },
      });
      if (!novoUsuario) {
        throw new HttpException(
          'Usuário informado para troca não existe',
          HttpStatus.NOT_FOUND,
        );
      }
      empreendedor.usuario = novoUsuario;
    }

    return this.empreendedorRepository.save(empreendedor);
  }

  async suspender(id: number): Promise<Empreendedor> {
    const empreendedor = await this.findById(id);
    if (empreendedor.usuario) {
      empreendedor.usuario.usuBoolAtivo = false;
      await this.usuarioRepository.save(empreendedor.usuario);
    }
    return empreendedor;
  }

  async reativar(id: number): Promise<Empreendedor> {
    const empreendedor = await this.findById(id);
    if (empreendedor.usuario) {
      empreendedor.usuario.usuBoolAtivo = true;
      await this.usuarioRepository.save(empreendedor.usuario);
    }
    return empreendedor;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.empreendedorRepository.delete(id);
  }

  async reativarDemanda(demIntId: number, usuarioId: number): Promise<Demanda> {
    const empreendedor = await this.findByUsuarioId(usuarioId);

    const demanda = await this.demandaRepository.findOne({
      where: { demIntId, empreendedor: { empIntId: empreendedor.empIntId } },
    });

    if (!demanda) {
      throw new HttpException(
        'Demanda inexistente ou não associada à sua conta',
        HttpStatus.NOT_FOUND,
      );
    }

    demanda.demBoolAtivo = true;
    demanda.demBoolAceitacao = false; // Ao reativar, volta obrigatoriamente para a esteira de triagem

    return this.demandaRepository.save(demanda);
  }

  async getDashboardDados(usuarioId: number): Promise<any> {
    const empreendedor = await this.findByUsuarioId(usuarioId);

    const empId = empreendedor.empIntId;

    // Métricas
    const totalDemandas = await this.demandaRepository.count({
      where: { empreendedor: { empIntId: empId } },
    });

    const aprovadasGaleria = await this.demandaRepository.count({
      where: {
        empreendedor: { empIntId: empId },
        demBoolAceitacao: true,
        demBoolAtivo: true,
      },
    });

    const analisePendente = await this.demandaRepository.count({
      where: {
        empreendedor: { empIntId: empId },
        demBoolAceitacao: false,
        demBoolAtivo: true,
      },
    });

    const candidaturasRecebidas = await this.candidaturaRepository.count({
      where: { demanda: { empreendedor: { empIntId: empId } } },
    });

    // Listas de demandas por aba
    const demandasPendentes = await this.demandaRepository.find({
      where: {
        empreendedor: { empIntId: empId },
        demBoolAceitacao: false,
        demBoolAtivo: true,
      },
      relations: ['candidatura', 'tipo'],
      order: { demDataCriacao: 'DESC' },
    });

    const demandasEmAndamento = await this.demandaRepository.find({
      where: {
        empreendedor: { empIntId: empId },
        demBoolAceitacao: true,
        demBoolAtivo: true,
      },
      relations: ['candidatura', 'candidatura.grupo', 'tipo'],
      order: { demDataCriacao: 'DESC' },
    });

    const demandasConcluidas = await this.demandaRepository.find({
      where: { empreendedor: { empIntId: empId }, demBoolAtivo: false },
      relations: ['candidatura', 'candidatura.grupo', 'tipo'],
      order: { demDataCriacao: 'DESC' },
    });

    const formatarDemanda = (d: any) => ({
      id: d.demIntId,
      nome: d.demStrNome,
      descricao: d.demStrDescricao,
      ativo: d.demBoolAtivo,
      aceitacao: d.demBoolAceitacao,
      semestreRecomendado: d.demStrSemestreRecomendado ?? null,
      areaTecnica: d.demStrAreaTecnica ?? null,
      tipagem: d.demStrTipagem ?? null,
      tipos: d.tipo?.map((t: any) => t.tipStrNome) ?? [],
      totalCandidaturas: d.candidatura?.length ?? 0,
      grupos:
        d.candidatura
          ?.filter((c: any) => c.grupo)
          .map((c: any) => c.grupo.gruStrNome) ?? [],
    });

    return {
      empresa: empreendedor.empStrEmpresa,
      cnpj: empreendedor.empChaCnpj,
      nome: empreendedor.usuario?.usuStrNome ?? '—',
      email: empreendedor.usuario?.usuStrEmail ?? '—',
      metricas: {
        totalDemandasSubmetidas: totalDemandas,
        demandasPublicadasNaGaleria: aprovadasGaleria,
        demandasEmAnalisePeloCoordenador: analisePendente,
        propostasDeGruposRecebidas: candidaturasRecebidas,
      },
      demandas: {
        pendentes: demandasPendentes.map(formatarDemanda),
        emAndamento: demandasEmAndamento.map(formatarDemanda),
        concluidas: demandasConcluidas.map(formatarDemanda),
      },
    };
  }
}
