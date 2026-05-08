import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';
import { CreateHistoricoProjetoDto } from '../dto/create-historico-projeto.dto';
import { UpdateHistoricoProjetoDto } from '../dto/update-historico-projeto.dto';

@Injectable()
export class HistoricoProjetoService {
  constructor(
    @InjectRepository(HistoricoProjeto)
    private historicoProjetoRepository: Repository<HistoricoProjeto>,
  ) {}

  async findAll(): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoRepository.find({ relations: ['projeto'] });
  }

  async findById(id: number): Promise<HistoricoProjeto | null> {
    return this.historicoProjetoRepository.findOne({
      where: { hspIntId: id },
      relations: ['projeto'],
    });
  }

  async findByhspStrDesc(hspStrDesc: string): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoRepository.find({
      where: { hspStrDesc },
      relations: ['projeto'],
    });
  }

  async create(dto: CreateHistoricoProjetoDto): Promise<HistoricoProjeto> {
    const historico = this.historicoProjetoRepository.create({
      ...dto,
      projeto: { proIntId: dto.proIntId } as any,
    });
    return this.historicoProjetoRepository.save(historico);
  }

  async update(id: number, dto: UpdateHistoricoProjetoDto): Promise<HistoricoProjeto | null> {
    const historico = await this.findById(id);
    if (!historico) return null;

    Object.assign(historico, dto);
    if (dto.proIntId) historico.projeto = { proIntId: dto.proIntId } as any;

    return this.historicoProjetoRepository.save(historico);
  }

  async delete(id: number) {
    return this.historicoProjetoRepository.delete(id);
  }
}
