import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Grupo } from '../entities/grupo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private grupoRepository: Repository<Grupo>,
  ) {}

  async findAll(): Promise<Grupo[]> {
    return await this.grupoRepository.find({
      relations: {},
    });
  }
}
