import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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

  // RN-10: Valida se quem está buscando a candidatura tem direito de visualizá-la
  async findById(id: number, userRequest?: { id: number; role: string }): Promise<Candidatura> {
    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId: id },
      relations: ['coordenador', 'demanda', 'grupo', 'grupo.usuario', 'demanda.empreendedor'],
    });

    if (!candidatura) {
      throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);
    }

    // Regra de Isolamento (RN-10): Grupos só veem suas próprias candidaturas
    if (userRequest && userRequest.role === 'Grupo') {
      const grupoDono = await this.grupoRepository.findOne({
        where: { usuario: { usuIntId: userRequest.id } }
      });
      if (!grupoDono || candidatura.grupo.gruIntId !== grupoDono.gruIntId) {
        throw new UnauthorizedException('Você não tem permissão para visualizar candidaturas de outros grupos.');
      }
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

    // Garante que não criará duplicado para candidaturas vigentes
    const existente = await this.candidaturaRepository.findOne({
      where: {
        grupo: { gruIntId: grupo.gruIntId },
        demanda: { demIntId: demanda.demIntId },
      },
    });

    if (existente && existente.canStrStatus !== StatusCandidatura.Desistente) {
      throw new HttpException('O seu grupo já possui uma candidatura ativa para esta demanda', HttpStatus.BAD_REQUEST);
    }

    const candidatura = this.candidaturaRepository.create({
      canStrStatus: StatusCandidatura.Pendente,
      canBoolAprovacao: false, // Forçado falso no início. Depende do fluxo do coordenador (RN-06)
      demanda: demanda,
      grupo: grupo,
    });

    return this.candidaturaRepository.save(candidatura);
  }

  async update(id: number, dto: UpdateCandidaturaDto): Promise<Candidatura> {
    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId: id },
      relations: ['coordenador', 'demanda', 'grupo']
    });
    
    if (!candidatura) {
      throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);
    }

    // Regra de integridade do Status (RN-06)
    if (dto.canStrStatus) {
      candidatura.canStrStatus = dto.canStrStatus;
      candidatura.canBoolAprovacao = dto.canStrStatus === StatusCandidatura.Aceita;
    }
    
    if (dto.cooIntId) {
      const coo = await this.coordenadorRepository.findOne({ where: { cooIntId: dto.cooIntId } });
      if (coo) candidatura.coordenador = coo;
    }

    return this.candidaturaRepository.save(candidatura);
  }

  // RN-14 & RF-19: Fluxo de Desistência acionado pelo próprio Grupo Logado
  async desistir(id: number, usuarioLogadoId: number): Promise<Candidatura> {
    const grupoDono = await this.grupoRepository.findOne({
      where: { usuario: { usuIntId: usuarioLogadoId } }
    });

    if (!grupoDono) {
      throw new UnauthorizedException('Usuário logado não possui um grupo vinculado.');
    }

    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId: id },
      relations: ['grupo']
    });

    if (!candidatura) {
      throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);
    }

    if (candidatura.grupo.gruIntId !== grupoDono.gruIntId) {
      throw new UnauthorizedException('Você só pode desistir de candidaturas do seu próprio grupo.');
    }

    candidatura.canStrStatus = StatusCandidatura.Desistente;
    candidatura.canBoolAprovacao = false;
    return this.candidaturaRepository.save(candidatura);
  }

  async delete(id: number): Promise<void> {
    const candidatura = await this.candidaturaRepository.findOne({ where: { canIntId: id } });
    if (!candidatura) throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);
    
    candidatura.canStrStatus = StatusCandidatura.Recusada;
    await this.candidaturaRepository.save(candidatura);
  }
}