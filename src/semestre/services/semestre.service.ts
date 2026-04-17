/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Grupo } from '../entities/semestre.entity';
import { ILike, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

//atualizar após ativar os relacionamentos
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

  async findById(id: number): Promise<Grupo[]> {
    return await this.grupoRepository.find({
      where: {
        idGrupo: id,
      },
      relations: {},
    });
  }

  async findByName(nome: string): Promise<Grupo[]> {
    return await this.grupoRepository.find({
      where: {
        nomeGrupo: ILike(`%${nome}%`),
      },
      relations: {},
    });
  }

  async create(grupo: Grupo): Promise<Grupo> {
    return await this.grupoRepository.save(grupo);
  }

  async update(grupo: Grupo): Promise<Grupo> {
    await this.findById(grupo.idGrupo);

    return await this.grupoRepository.save(grupo);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.grupoRepository.delete(id);
  }
}
