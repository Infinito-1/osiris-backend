import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.demandaRepository.findOne({ where: { demIntId: id } });
  }

  async findByNome(nome: string): Promise<Demanda[]> {
    return this.demandaRepository.find({ where: { demStrNome: nome } });
  }

  async create(demanda: Demanda): Promise<Demanda> {
    return this.demandaRepository.save(demanda);
  }

  async update(demanda: Demanda): Promise<Demanda> {
    return this.demandaRepository.save(demanda);
  }

  async delete(id: number) {
    return this.demandaRepository.delete(id);
  }
}
