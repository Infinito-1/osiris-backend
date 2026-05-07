import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Grupo } from '../entities/grupo.entity';
import { Repository, ILike } from 'typeorm';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { UpdateGrupoDto } from '../dto/update-grupo.dto';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private grupoRepository: Repository<Grupo>,
  ) {}

  async findAll(): Promise<Grupo[]> {
    return this.grupoRepository.find({ relations: ['usuario'] });
  }

  async findById(id: number): Promise<Grupo | null> {
    return this.grupoRepository.findOne({ where: { gruIntId: id }, relations: ['usuario'] });
  }

  async findByName(nome: string): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { gruStrNome: ILike(`%${nome}%`) },
      relations: ['usuario'],
    });
  }

  async create(dto: CreateGrupoDto): Promise<Grupo> {
    const grupo = this.grupoRepository.create({
      ...dto,
      usuario: { usuIntId: dto.usuIntId } as any,
    });
    return this.grupoRepository.save(grupo);
  }

  async update(id: number, dto: UpdateGrupoDto): Promise<Grupo | null> {
    const grupo = await this.findById(id);
    if (!grupo) return null;

    Object.assign(grupo, dto);
    if (dto.usuIntId) {
      grupo.usuario = { usuIntId: dto.usuIntId } as any;
    }

    return this.grupoRepository.save(grupo);
  }

  async delete(id: number) {
    return this.grupoRepository.delete(id);
  }
}
