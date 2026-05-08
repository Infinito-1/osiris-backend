import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coordenador } from '../entities/coordenador.entity';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';

@Injectable()
export class CoordenadorService {
  constructor(
    @InjectRepository(Coordenador)
    private readonly coordenadorRepository: Repository<Coordenador>,
  ) {}

  async findAll(): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({ relations: ['usuario'] });
  }

  async findById(id: number): Promise<Coordenador | null> {
    return this.coordenadorRepository.findOne({
      where: { cooIntId: id },
      relations: ['usuario'],
    });
  }

  async findByCurso(curso: string): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({
      where: { cooStrCurso: curso },
      relations: ['usuario'],
    });
  }

  async create(dto: CreateCoordenadorDto): Promise<Coordenador> {
    const coordenador = this.coordenadorRepository.create({
      ...dto,
      usuario: { usuIntId: dto.usuIntId } as any,
    });
    return this.coordenadorRepository.save(coordenador);
  }

  async update(id: number, dto: UpdateCoordenadorDto): Promise<Coordenador | null> {
    const coordenador = await this.findById(id);
    if (!coordenador) return null;

    Object.assign(coordenador, dto);
    if (dto.usuIntId) {
      coordenador.usuario = { usuIntId: dto.usuIntId } as any;
    }

    return this.coordenadorRepository.save(coordenador);
  }

  async delete(id: number) {
    return this.coordenadorRepository.delete(id);
  }
}
