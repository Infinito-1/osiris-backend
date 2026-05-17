import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coordenador } from '../entities/coordenador.entity';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { ClassificarDemandaDto } from '../dto/classificar-demanda.dto';
import { GerenciarCandidaturaDto } from '../dto/gerenciar-candidatura.dto';
import { StatusCandidatura } from '../../candidatura/dto/status.enum';

@Injectable()
export class CoordenadorService {
  constructor(
    @InjectRepository(Coordenador)
    private readonly coordenadorRepository: Repository<Coordenador>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
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

  // UC-03 — Classificar Demanda
  async classificarDemanda(id: number, dto: ClassificarDemandaDto): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    demanda.demStrSemestreRecomendado = dto.semestre;
    demanda.demStrAreaTecnica = dto.areaTecnica;
    demanda.demStrTipagem = dto.tipagem;

    return this.demandaRepository.save(demanda);
  }

  // UC-04 — Aprovar Demanda
  async aprovarDemanda(id: number): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ where: { demIntId: id } });
    if (!demanda) throw new HttpException('Demanda não encontrada', HttpStatus.NOT_FOUND);

    demanda.demBoolAceitacao = true;
    return this.demandaRepository.save(demanda);
  }

  // UC-05 — Gerenciar Candidaturas
  async gerenciarCandidaturas(id: number, dto: GerenciarCandidaturaDto): Promise<Candidatura> {
    const candidatura = await this.candidaturaRepository.findOne({ where: { canIntId: dto.candidaturaId } });
    if (!candidatura) throw new HttpException('Candidatura não encontrada', HttpStatus.NOT_FOUND);

    // validação do enum
    if (!Object.values(StatusCandidatura).includes(dto.status)) {
      throw new HttpException('Status inválido', HttpStatus.BAD_REQUEST);
    }

    candidatura.canStrStatus = dto.status;
    return this.candidaturaRepository.save(candidatura);
  }
}
