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
        tip_int_id: id,
      },
      relations: {},
    });
  }

  async findByName(nome: string): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      where: {
        tip_str_nome: ILike(`%${nome}%`),
      },
      relations: {},
    });
  }

  async create(tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    return await this.tipoDemandaRepository.save(tipoDemanda);
  }

  async update(tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    await this.findById(tipoDemanda.tip_int_id);

    return await this.tipoDemandaRepository.save(tipoDemanda);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.tipoDemandaRepository.delete(id);
  }
}
