import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidatura } from '../entities/candidatura.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Coordenador } from '../../coordenador/entities/coordenador.entity';
import { CreateCandidaturaDto } from '../dto/create-candidatura.dto';
import { UpdateCandidaturaDto } from '../dto/update-candidatura.dto';
import { StatusCandidatura } from '../dto/status.enum';

@Injectable()
export class CandidaturaService {
  constructor(
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Coordenador)
    private readonly coordenadorRepository: Repository<Coordenador>,
  ) {}

  async findAll(): Promise<Candidatura[]> {
    return this.candidaturaRepository.find({
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async findById(id: number): Promise<Candidatura> {
    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId: id },
      relations: ['coordenador', 'demanda', 'grupo'],
    });
    if (!candidatura) {
      throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);
    }
    return candidatura;
  }

  async findByStatus(status: StatusCandidatura): Promise<Candidatura[]> {
    return this.candidaturaRepository.find({
      where: { canStrStatus: status },
      relations: ['coordenador', 'demanda', 'grupo'],
    });
  }

  async create(dto: CreateCandidaturaDto, usuarioLogadoId?: number): Promise<Candidatura> {
    let grupoId = dto.gruIntId;

    if (usuarioLogadoId) {
      const grupoDono = await this.grupoRepository.findOne({
        where: { usuario: { usuIntId: usuarioLogadoId } }
      });
      if (grupoDono) {
        grupoId = grupoDono.gruIntId;
      }
    }

    const grupo = await this.grupoRepository.findOne({ where: { gruIntId: grupoId } });
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: dto.demIntId } });
    
    if (!grupo || !demanda) {
      throw new HttpException('Grupo ou Demanda base não encontrados para consolidação', HttpStatus.NOT_FOUND);
    }

    const existente = await this.candidaturaRepository.findOne({
      where: {
        grupo: { gruIntId: grupo.gruIntId },
        demanda: { demIntId: demanda.demIntId },
      },
    });

    if (existente) {
      throw new HttpException('O seu grupo já possui uma candidatura ativa para esta demanda', HttpStatus.BAD_REQUEST);
    }

    const coordenadorAlvo = dto.cooIntId 
      ? await this.coordenadorRepository.findOne({ where: { cooIntId: dto.cooIntId } }) 
      : undefined;

    const candidatura = this.candidaturaRepository.create({
      canStrStatus: StatusCandidatura.Pendente,
      canBoolAprovacao: dto.canBoolAprovacao || false,
      demanda: demanda,
      grupo: grupo,
      coordenador: coordenadorAlvo || undefined
    });

    return this.candidaturaRepository.save(candidatura);
  }

  async update(id: number, dto: UpdateCandidaturaDto): Promise<Candidatura> {
    const candidatura = await this.findById(id);

    if (dto.canStrStatus) candidatura.canStrStatus = dto.canStrStatus;
    if (dto.canBoolAprovacao !== undefined) candidatura.canBoolAprovacao = dto.canBoolAprovacao;
    
    if (dto.cooIntId) {
      const coo = await this.coordenadorRepository.findOne({ where: { cooIntId: dto.cooIntId } });
      if (coo) candidatura.coordenador = coo || undefined;
    }
    if (dto.demIntId) {
      const dem = await this.demandaRepository.findOne({ where: { demIntId: dto.demIntId } });
      if (dem) candidatura.demanda = dem;
    }
    if (dto.gruIntId) {
      const gru = await this.grupoRepository.findOne({ where: { gruIntId: dto.gruIntId } });
      if (gru) candidatura.grupo = gru;
    }

    return this.candidaturaRepository.save(candidatura);
  }

  async delete(id: number): Promise<void> {
    const candidatura = await this.findById(id);
    candidatura.canStrStatus = StatusCandidatura.Recusada;
    await this.candidaturaRepository.save(candidatura);
  }
}