/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoDemanda } from '../entities/tipo_demanda.entity';
import { ILike, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class TipoDemandaService {
  constructor(
    @InjectRepository(TipoDemanda)
    private tipoDemandaRepository: Repository<TipoDemanda>,
  ) {}

  async findAll(): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      relations: {},
    });
  }

  async findById(id: number): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      where: {
        tipIntId: id,
      },
      relations: {},
    });
  }

  async findByName(tipStrNome: string): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      where: {
        tipStrNome: ILike(`%${tipStrNome}%`),
      },
      relations: {},
    });
  }

  async create(tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    return await this.tipoDemandaRepository.save(tipoDemanda);
  }

  async update(tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    await this.findById(tipoDemanda.tipIntId);

    return await this.tipoDemandaRepository.save(tipoDemanda);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.tipoDemandaRepository.delete(id);
  }
}
