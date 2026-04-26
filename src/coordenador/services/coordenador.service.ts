import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coordenador } from '../entities/coordenador.entity';

@Injectable()
export class CoordenadorService {
  constructor(
    @InjectRepository(Coordenador)
    private readonly coordenadorRepository: Repository<Coordenador>,
  ) {}

  async findAll(): Promise<Coordenador[]> {
    return this.coordenadorRepository.find();
  }

  async findById(id: number): Promise<Coordenador | null> {
    return this.coordenadorRepository.findOne({ where: { cooIntId: id } });
  }

  async findByCurso(curso: string): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({ where: { cooStrCurso: curso } });
  }

  async create(coordenador: Coordenador): Promise<Coordenador> {
    return this.coordenadorRepository.save(coordenador);
  }

  async update(coordenador: Coordenador): Promise<Coordenador> {
    return this.coordenadorRepository.save(coordenador);
  }

  async delete(id: number) {
    return this.coordenadorRepository.delete(id);
  }
}
