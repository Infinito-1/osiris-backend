import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projeto } from '../entities/projeto.entity';

@Injectable()
export class ProjetoService {
  constructor(
    @InjectRepository(Projeto)
    private projetoRepository: Repository<Projeto>,
  ) {}

  async findAll(): Promise<Projeto[]> {
    return this.projetoRepository.find();
  }

  async findById(id: number): Promise<Projeto | undefined> {
    return this.projetoRepository.findOne({ where: { pro_int_id: id } });
  }

  async create(projeto: Projeto): Promise<Projeto> {
    return this.projetoRepository.save(projeto);
  }

  async update(id: number, projeto: Projeto): Promise<Projeto | undefined> {
    await this.projetoRepository.update(id, projeto);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.projetoRepository.delete(id);
  }
}
