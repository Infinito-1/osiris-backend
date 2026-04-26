import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Semestre } from '../entities/semestre.entity';
import { Repository } from 'typeorm';

//atualizar após ativar os relacionamentos
@Injectable()
export class SemestreService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Semestre)
    private semestreRepository: Repository<Semestre>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed(): Promise<void> {
    const count = await this.semestreRepository.count();
    if (count > 0) return;

    await this.semestreRepository.save([
      { descricaoSemestre: '1' },
      { descricaoSemestre: '2' },
      { descricaoSemestre: '3' },
      { descricaoSemestre: '4' },
      { descricaoSemestre: '5' },
      { descricaoSemestre: '6' },
    ]);
  }

  async findAll(): Promise<Semestre[]> {
    return await this.semestreRepository.find({
      relations: {},
    });
  }

  async findById(id: number): Promise<Semestre | null> {
    return await this.semestreRepository.findOne({
      where: {
        idSemestre: id,
      },
      relations: {},
    });
  }
}
