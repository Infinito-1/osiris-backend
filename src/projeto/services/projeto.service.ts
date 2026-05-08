import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projeto } from '../entities/projeto.entity';
import { CreateProjetoDto } from '../dto/create-projeto.dto';
import { UpdateProjetoDto } from '../dto/update-projeto.dto';

@Injectable()
export class ProjetoService {
  constructor(
    @InjectRepository(Projeto)
    private projetoRepository: Repository<Projeto>,
  ) {}

  async findAll(): Promise<Projeto[]> {
    return this.projetoRepository.find({ relations: ['candidatura'] });
  }

  async findById(id: number): Promise<Projeto | null> {
    return this.projetoRepository.findOne({
      where: { proIntId: id },
      relations: ['candidatura'],
    });
  }

  async create(dto: CreateProjetoDto): Promise<Projeto> {
    const projeto = this.projetoRepository.create({
      ...dto,
      candidatura: { canIntId: dto.canIntId } as any,
    });
    return this.projetoRepository.save(projeto);
  }

  async update(id: number, dto: UpdateProjetoDto): Promise<Projeto | null> {
    const projeto = await this.findById(id);
    if (!projeto) return null;

    Object.assign(projeto, dto);
    if (dto.canIntId) {
      projeto.candidatura = { canIntId: dto.canIntId } as any;
    }

    return this.projetoRepository.save(projeto);
  }

  async delete(id: number): Promise<void> {
    await this.projetoRepository.delete(id);
  }
}
