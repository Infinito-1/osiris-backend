import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Demanda } from '../entities/demanda.entity';

@Injectable()
export class DemandaService {
  constructor(
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
  ) {}

  async findAll(): Promise<Demanda[]> {
    return this.demandaRepository.find();
  }

  async findById(id: number): Promise<Demanda | null> {
    return this.demandaRepository.findOne({
      where: { demIntId: id, demBoolAtivo: true, demBoolAceitacao: true },
    });
  }

  async findByNome(nome: string): Promise<Demanda[]> {
    return this.demandaRepository.find({
      where: { demStrNome: ILike(`%${nome}%`) },
    });
  }

  async findAllData(ordem: 'ASC' | 'DESC'): Promise<Demanda[]> {
    return this.demandaRepository.find({
      order: { demDataCriacao: ordem },
      where: { demBoolAtivo: true, demBoolAceitacao: true },
    });
  }

  async create(demanda: Demanda): Promise<Demanda> {
    return this.demandaRepository.save(demanda);
  }

  async update(demanda: Demanda): Promise<Demanda> {
    return this.demandaRepository.save(demanda);
  }

  async desativar(id: number): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId: id },
    });
    if (!demanda) {
      throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);
    }
    demanda.demBoolAtivo = false;
    return this.demandaRepository.save(demanda);
  }

  async delete(id: number) {
    return this.demandaRepository.delete(id);
  }
}
