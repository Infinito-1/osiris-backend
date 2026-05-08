/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoDemanda } from '../entities/tipo_demanda.entity';
import { ILike, In, Repository } from 'typeorm';
// import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class TipoDemandaService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(TipoDemanda)
    private tipoDemandaRepository: Repository<TipoDemanda>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed(): Promise<void> {
    const count = await this.tipoDemandaRepository.count();
    if (count > 0) return;

    await this.tipoDemandaRepository.save([
      { tipStrNome: 'Sistema Web' },
      { tipStrNome: 'Aplicativo Mobile' },
      { tipStrNome: 'Landing Page' },
      { tipStrNome: 'E-commerce' },
    ]);
  }

  async findAll(): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find();
  }

  async findById(id: number): Promise<TipoDemanda | null> {
    return await this.tipoDemandaRepository.findOne({
      where: {
        tipIntId: id,
      },
    });
  }

  async findByName(tipStrNome: string): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      where: {
        tipStrNome: ILike(`%${tipStrNome}%`),
      },
      relations: {
        demandas: true,
      },
    });
  }

  async findComDemandas(ids: number[]): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      where: {
        tipIntId: In(ids),
      },
      relations: {
        demandas: true,
      },
    });
  }

  async create(tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    return await this.tipoDemandaRepository.save(tipoDemanda);
  }

  async update(tipoDemanda: TipoDemanda): Promise<TipoDemanda> {
    await this.findById(tipoDemanda.tipIntId);

    return await this.tipoDemandaRepository.save(tipoDemanda);
  }

  // async delete(id: number): Promise<DeleteResult> {
  //   await this.findById(id);

  //   return await this.tipoDemandaRepository.delete(id);
  // }
}
