import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidatura } from '../entities/candidatura.entity';
import { CreateCandidaturaDto } from '../dto/create-candidatura.dto';
import { UpdateCandidaturaDto } from '../dto/update-candidatura.dto';
import { StatusCandidatura } from '../dto/status.enum';

@Injectable()
export class CandidaturaService {
  constructor(
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
  ) {}

  async findAll(): Promise<Candidatura[]> {
    return this.candidaturaRepository.find({
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async findById(id: number): Promise<Candidatura | null> {
    return this.candidaturaRepository.findOne({
      where: { canIntId: id },
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async findByStatus(status: string): Promise<Candidatura[]> {
    // converte string para enum e valida
    const statusEnum = Object.values(StatusCandidatura).includes(status as StatusCandidatura)
      ? (status as StatusCandidatura)
      : undefined;

    if (!statusEnum) {
      throw new HttpException('Status inválido', HttpStatus.BAD_REQUEST);
    }

    return this.candidaturaRepository.find({
      where: { canStrStatus: statusEnum },
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async create(dto: CreateCandidaturaDto): Promise<Candidatura> {
    const candidatura = this.candidaturaRepository.create({
      canStrStatus: dto.canStrStatus,
      canBoolAprovacao: dto.canBoolAprovacao,
      coordenador: { cooIntId: dto.cooIntId } as any,
      demanda: { demIntId: dto.demIntId } as any,
      grupo: { gruIntId: dto.gruIntId } as any,
    });

    return this.candidaturaRepository.save(candidatura);
  }

  async update(id: number, dto: UpdateCandidaturaDto): Promise<Candidatura | null> {
    const candidatura = await this.findById(id);
    if (!candidatura) {
      throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);
    }

    if (dto.canStrStatus) candidatura.canStrStatus = dto.canStrStatus;
    if (dto.canBoolAprovacao !== undefined) candidatura.canBoolAprovacao = dto.canBoolAprovacao;
    if (dto.cooIntId) candidatura.coordenador = { cooIntId: dto.cooIntId } as any;
    if (dto.demIntId) candidatura.demanda = { demIntId: dto.demIntId } as any;
    if (dto.gruIntId) candidatura.grupo = { gruIntId: dto.gruIntId } as any;

    return this.candidaturaRepository.save(candidatura);
  }

  async delete(id: number): Promise<void> {
    const candidatura = await this.findById(id);
    if (!candidatura) {
      throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);
    }
    await this.candidaturaRepository.delete(id);
  }
}
