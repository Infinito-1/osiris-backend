import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.demandaRepository.find({ relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'] });
  }

  async findById(id: number): Promise<Demanda | null> {
    return this.demandaRepository.findOne({
      where: { demIntId: id },
      relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'],
    });
  }

  async findByNome(nome: string): Promise<Demanda[]> {
    return this.demandaRepository.find({
      where: { demStrNome: nome },
      relations: ['semestre', 'empreendedor', 'coordenador', 'tipo'],
    });
  }

  async create(dto: CreateDemandaDto): Promise<Demanda> {
    const demanda = this.demandaRepository.create({
      ...dto,
      semestre: { semIntId: dto.semIntId } as any,
      empreendedor: { empIntId: dto.empIntId } as any,
      coordenador: { cooIntId: dto.cooIntId } as any,
      tipo: dto.tipIntIds?.map((id) => ({ tipIntId: id } as any)),
    });
    return this.demandaRepository.save(demanda);
  }

  async update(id: number, dto: UpdateDemandaDto): Promise<Demanda | null> {
    const demanda = await this.findById(id);
    if (!demanda) return null;

    Object.assign(demanda, dto);
    if (dto.semIntId) demanda.semestre = { semIntId: dto.semIntId } as any;
    if (dto.empIntId) demanda.empreendedor = { empIntId: dto.empIntId } as any;
    if (dto.cooIntId) demanda.coordenador = { cooIntId: dto.cooIntId } as any;
    if (dto.tipIntIds) demanda.tipo = dto.tipIntIds.map((id) => ({ tipIntId: id } as any));

    return this.demandaRepository.save(demanda);
  }

  async delete(id: number) {
    return this.demandaRepository.delete(id);
  }
}
