import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidatura } from '../entities/candidatura.entity';

@Injectable()
export class CandidaturaService {
  constructor(
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
  ) {}

  async findAll(): Promise<Candidatura[]> {
    return this.candidaturaRepository.find();
  }

  async findById(id: number): Promise<Candidatura | null> {
    return this.candidaturaRepository.findOne({ where: { canIntId: id } });
  }

  async findByStatus(status: string): Promise<Candidatura[]> {
    return this.candidaturaRepository.find({ where: { canStrStatus: status } });
  }

  async create(candidatura: Candidatura): Promise<Candidatura> {
    return this.candidaturaRepository.save(candidatura);
  }

  async update(candidatura: Candidatura): Promise<Candidatura> {
    return this.candidaturaRepository.save(candidatura);
  }

  async delete(id: number) {
    return this.candidaturaRepository.delete(id);
  }
}
