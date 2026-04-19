/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';
import { ILike, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class HistoricoProjetoService {
  constructor(
    @InjectRepository(HistoricoProjeto)
    private historicoProjetoRepository: Repository<HistoricoProjeto>,
  ) {}

  async findAll(): Promise<HistoricoProjeto[]> {
    return await this.historicoProjetoRepository.find({
      relations: {},
    });
  }

  async findById(id: number): Promise<HistoricoProjeto[]> {
    return await this.historicoProjetoRepository.find({
      where: {
        hsp_int_id: id,
      },
      relations: {},
    });
  }

  async findByDesc(desc: string): Promise<HistoricoProjeto[]> {
    return await this.historicoProjetoRepository.find({
      where: {
        hsp_str_desc: ILike(`%${desc}%`),
      },
      relations: {},
    });
  }

  async create(historico: HistoricoProjeto): Promise<HistoricoProjeto> {
    return await this.historicoProjetoRepository.save(historico);
  }

  async update(historico: HistoricoProjeto): Promise<HistoricoProjeto> {
    await this.findById(historico.hsp_int_id);

    return await this.historicoProjetoRepository.save(historico);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.historicoProjetoRepository.delete(id);
  }
}
