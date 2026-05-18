import { Injectable, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Semestre } from '../entities/semestre.entity';

@Injectable()
export class SemestreService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Semestre)
    private readonly semestreRepository: Repository<Semestre>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed(): Promise<void> {
    const count = await this.semestreRepository.count();
    if (count > 0) return;

    await this.semestreRepository.save([
      { semStrDescricao: '1' },
      { semStrDescricao: '2' },
      { semStrDescricao: '3' },
      { semStrDescricao: '4' },
      { semStrDescricao: '5' },
      { semStrDescricao: '6' },
    ]);
  }

  async findAll(): Promise<Semestre[]> {
    return this.semestreRepository.find();
  }

  async findById(id: number): Promise<Semestre> {
    const semestre = await this.semestreRepository.findOne({
      where: { semIntId: id },
      relations: { grupo: true },
    });

    if (!semestre) {
      throw new HttpException('Semestre letivo informado não encontrado', HttpStatus.NOT_FOUND);
    }
    return semestre;
  }

  async findComGrupos(ids: number[]): Promise<Semestre[]> {
    if (!ids || ids.length === 0) {
      throw new HttpException('Nenhum identificador de semestre foi fornecido', HttpStatus.BAD_REQUEST);
    }

    return this.semestreRepository.find({
      where: { semIntId: In(ids) },
      relations: { grupo: true },
    });
  }

  async findComDemandas(ids: number[]): Promise<Semestre[]> {
    if (!ids || ids.length === 0) {
      throw new HttpException('Nenhum identificador de semestre foi fornecido', HttpStatus.BAD_REQUEST);
    }

    return this.semestreRepository.find({
      where: { semIntId: In(ids) },
      relations: { demanda: true },
    });
  }
}
