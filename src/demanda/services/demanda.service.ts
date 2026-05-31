import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Demanda } from '../entities/demanda.entity';
import { CreateDemandaDto } from '../dto/create-demanda.dto';
import { UpdateDemandaDto } from '../dto/update-demanda.dto';
import { TipoDemanda } from '../../tipo_demanda/entities/tipo_demanda.entity';
import { TipoDemandaService } from '../../tipo_demanda/services/tipo_demanda.services';

@Injectable()
export class DemandaService {
  constructor(
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    private readonly tipoDemandaService: TipoDemandaService,
  ) {}

  // Usado por Admins e Coordenadores para ver TODAS as demandas no painel gerencial de triagem
  async findAll(): Promise<Demanda[]> {
    return this.demandaRepository.find({
      relations: ['semestre', 'empreendedor', 'empreendedor.usuario', 'coordenador', 'tipo'],
    });
  }

  // 🚀 Alimenta a vitrine do front-end aberta para visitantes (com o decorator @Public)
  async findGaleria(): Promise<Demanda[]> {
    return this.demandaRepository.find({
      where: { demBoolAtivo: true, demBoolAceitacao: true },
      relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'],
      order: { demDataCriacao: 'DESC' },
    });
  }

  // Busca detalhada por ID (lança 404 caso não exista)
  async findById(id: number): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId: id },
      relations: ['semestre', 'empreendedor', 'empreendedor.usuario', 'coordenador', 'tipo'],
    });
    if (!demanda) {
      throw new HttpException('Demanda não encontrada no sistema', HttpStatus.NOT_FOUND);
    }
    return demanda;
  }

  async findOneInternal(id: number): Promise<Demanda> {
    return this.findById(id);
  }

  async findByNome(nome: string): Promise<Demanda[]> {
    return this.demandaRepository.find({
      where: { demStrNome: ILike(`%${nome}%`), demBoolAtivo: true, demBoolAceitacao: true },
      relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'],
    });
  }

  async findAllData(ordem: 'ASC' | 'DESC'): Promise<Demanda[]> {
    return this.demandaRepository.find({
      order: { demDataCriacao: ordem },
      where: { demBoolAtivo: true, demBoolAceitacao: true },
      relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'],
    });
  }

  // BL-13: Toda demanda criada nasce pendente de aprovação (demBoolAceitacao = false)
  async create(dto: CreateDemandaDto): Promise<Demanda> {
    const tipos: TipoDemanda[] = [];

    if (dto.tipIntIds && dto.tipIntIds.length > 0) {
      for (const id of dto.tipIntIds) {
        const tipo = await this.tipoDemandaService.findById(id);
        if (tipo) tipos.push(tipo);
      }
    }

    if (dto.tipStrNomes && dto.tipStrNomes.length > 0) {
      for (const nome of dto.tipStrNomes) {
        const tipo = await this.tipoDemandaService.findOrCreate(nome);
        tipos.push(tipo);
      }
    }

    const demanda = this.demandaRepository.create({
      demStrNome: dto.demStrNome,
      demStrDescricao: dto.demStrDescricao,
      demBoolAceitaMudancaTipo: dto.demBoolAceitaMudancaTipo,
      demBoolAceitacao: false, // Força a regra de negócio do ecossistema Osiris
      demBoolAtivo: true,
      demBoolExibirContato: dto.demBoolExibirContato ?? false,
      semestre: dto.semIntId ? ({ semIntId: dto.semIntId } as any) : null,
      empreendedor: { empIntId: dto.empIntId } as any,
      coordenador: dto.cooIntId ? ({ cooIntId: dto.cooIntId } as any) : null,
      tipo: tipos,
    });

    return this.demandaRepository.save(demanda);
  }

  async update(id: number, dto: UpdateDemandaDto): Promise<Demanda> {
    const demanda = await this.findOneInternal(id);

    if (dto.demStrNome) demanda.demStrNome = dto.demStrNome;
    if (dto.demStrDescricao) demanda.demStrDescricao = dto.demStrDescricao;
    if (dto.demBoolAceitaMudancaTipo !== undefined) demanda.demBoolAceitaMudancaTipo = dto.demBoolAceitaMudancaTipo;
    
    if (dto.demBoolExibirContato !== undefined) demanda.demBoolExibirContato = dto.demBoolExibirContato;
    if (dto.demBoolAceitacao !== undefined) {
      demanda.demBoolAceitacao = dto.demBoolAceitacao;
    }

    if (dto.semIntId) demanda.semestre = { semIntId: dto.semIntId } as any;
    if (dto.empIntId) demanda.empreendedor = { empIntId: dto.empIntId } as any;
    if (dto.cooIntId) demanda.coordenador = { cooIntId: dto.cooIntId } as any;

    const tipos: TipoDemanda[] = [];
    if (dto.tipIntIds && dto.tipIntIds.length > 0) {
      for (const id of dto.tipIntIds) {
        const tipo = await this.tipoDemandaService.findById(id);
        if (tipo) tipos.push(tipo);
      }
    }
    if (dto.tipStrNomes && dto.tipStrNomes.length > 0) {
      for (const nome of dto.tipStrNomes) {
        const tipo = await this.tipoDemandaService.findOrCreate(nome);
        tipos.push(tipo);
      }
    }
    if (tipos.length > 0) {
      demanda.tipo = tipos;
    }

    return this.demandaRepository.save(demanda);
  }

  async desativar(id: number): Promise<Demanda> {
    const demanda = await this.findOneInternal(id);
    demanda.demBoolAtivo = false;
    return this.demandaRepository.save(demanda);
  }

  async delete(id: number): Promise<void> {
    await this.findOneInternal(id);
    await this.demandaRepository.delete(id);
  }
}