import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Demanda } from '../entities/demanda.entity';
import { CreateDemandaDto } from '../dto/create-demanda.dto';
import { UpdateDemandaDto } from '../dto/update-demanda.dto';

@Injectable()
export class DemandaService {
  constructor(
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
  ) {}

  async findAll(): Promise<Demanda[]> {
    return this.demandaRepository.find({
      relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'],
    });
  }

  async findById(id: number): Promise<Demanda | null> {
    return this.demandaRepository.findOne({
      where: { demIntId: id, demBoolAtivo: true, demBoolAceitacao: true },
      relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'],
    });
  }

  async findByNome(nome: string): Promise<Demanda[]> {
    return this.demandaRepository.find({
      where: { demStrNome: ILike(`%${nome}%`) },
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

  async create(dto: CreateDemandaDto): Promise<Demanda> {
    const demanda = this.demandaRepository.create({
      demStrNome: dto.demStrNome,
      demStrDescricao: dto.demStrDescricao,
      demBoolAceitaMudancaTipo: dto.demBoolAceitaMudancaTipo,
      demBoolAceitacao: dto.demBoolAceitacao,
      semestre: { semIntId: dto.semIntId } as any,
      empreendedor: { empIntId: dto.empIntId } as any,
      coordenador: { cooIntId: dto.cooIntId } as any,
      tipo: dto.tipIntIds?.map((id) => ({ tipIntId: id } as any)),
    });

    return this.demandaRepository.save(demanda);
  }

  async update(id: number, dto: UpdateDemandaDto): Promise<Demanda | null> {
    const demanda = await this.findById(id);
    if (!demanda) {
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);
    }

    if (dto.demStrNome) demanda.demStrNome = dto.demStrNome;
    if (dto.demStrDescricao) demanda.demStrDescricao = dto.demStrDescricao;
    if (dto.demBoolAceitaMudancaTipo !== undefined) {
      demanda.demBoolAceitaMudancaTipo = dto.demBoolAceitaMudancaTipo;
    }
    if (dto.demBoolAceitacao !== undefined) {
      demanda.demBoolAceitacao = dto.demBoolAceitacao;
    }
    if (dto.semIntId) demanda.semestre = { semIntId: dto.semIntId } as any;
    if (dto.empIntId) demanda.empreendedor = { empIntId: dto.empIntId } as any;
    if (dto.cooIntId) demanda.coordenador = { cooIntId: dto.cooIntId } as any;
    if (dto.tipIntIds) {
      demanda.tipo = dto.tipIntIds.map((id) => ({ tipIntId: id } as any));
    }

    return this.demandaRepository.save(demanda);
  }

  async desativar(id: number): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) {
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);
    }
    demanda.demBoolAtivo = false;
    return this.demandaRepository.save(demanda);
  }

  async delete(id: number): Promise<void> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) {
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);
    }
    await this.demandaRepository.delete(id);
  }
}
