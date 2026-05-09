import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coordenador } from '../entities/coordenador.entity';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class CoordenadorService {
  constructor(
    @InjectRepository(Coordenador)
    private readonly coordenadorRepository: Repository<Coordenador>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({ relations: ['usuario', 'demanda', 'candidatura'] });
  }

  async findById(id: number): Promise<Coordenador | null> {
    return this.coordenadorRepository.findOne({
      where: { cooIntId: id },
      relations: ['usuario', 'demanda', 'candidatura'],
    });
  }

  async findByCurso(curso: string): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({
      where: { cooStrCurso: curso },
      relations: ['usuario'],
    });
  }

  async create(dto: CreateCoordenadorDto): Promise<Coordenador> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: dto.usuIntId } });
    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    const coordenador = this.coordenadorRepository.create({
      cooStrCurso: dto.cooStrCurso,
      usuario,
    });

    return this.coordenadorRepository.save(coordenador);
  }

  async update(id: number, dto: UpdateCoordenadorDto): Promise<Coordenador | null> {
    const coordenador = await this.findById(id);
    if (!coordenador) {
      throw new HttpException('Coordenador não encontrado', HttpStatus.NOT_FOUND);
    }

    if (dto.cooStrCurso) coordenador.cooStrCurso = dto.cooStrCurso;

    return this.coordenadorRepository.save(coordenador);
  }

  async delete(id: number): Promise<void> {
    const coordenador = await this.findById(id);
    if (!coordenador) {
      throw new HttpException('Coordenador não encontrado', HttpStatus.NOT_FOUND);
    }
    await this.coordenadorRepository.delete(id);
  }
}
