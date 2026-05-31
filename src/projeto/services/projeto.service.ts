import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projeto } from '../entities/projeto.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { CreateProjetoDto } from '../dto/create-projeto.dto';
import { UpdateProjetoDto } from '../dto/update-projeto.dto';
import { StatusCandidatura } from '../../candidatura/dto/status.enum';

@Injectable()
export class ProjetoService {
  constructor(
    @InjectRepository(Projeto)
    private readonly projetoRepository: Repository<Projeto>,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
  ) {}

  async findAll(): Promise<Projeto[]> {
    return this.projetoRepository.find({
      where: { proBoolAtivo: true },
      relations: ['candidatura', 'candidatura.grupo', 'candidatura.demanda'],
    });
  }

  async findById(id: number): Promise<Projeto> {
    const projeto = await this.projetoRepository.findOne({
      where: { proIntId: id },
      relations: ['candidatura', 'candidatura.grupo', 'candidatura.demanda'],
    });

    if (!projeto) {
      throw new HttpException(
        'Projeto acadêmico não encontrado no Osiris',
        HttpStatus.NOT_FOUND,
      );
    }
    return projeto;
  }

  async create(dto: CreateProjetoDto): Promise<Projeto> {
    let candidatura: Candidatura | null = null;

    if (dto.canIntId) {
      candidatura = await this.candidaturaRepository.findOne({
        where: { canIntId: dto.canIntId },
      });
      if (!candidatura) {
        throw new HttpException(
          'Candidatura base não encontrada no ecossistema',
          HttpStatus.NOT_FOUND,
        );
      }
      if (candidatura.canStrStatus !== StatusCandidatura.Aceita) {
        throw new HttpException(
          `Não é possível iniciar um projeto. A candidatura encontra-se em estado: ${candidatura.canStrStatus}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const projetoExistente = await this.projetoRepository.findOne({
        where: { candidatura: { canIntId: dto.canIntId }, proBoolAtivo: true },
      });
      if (projetoExistente) {
        throw new HttpException(
          'Já existe um projeto ativo em andamento para esta candidatura.',
          HttpStatus.CONFLICT,
        );
      }
    }

    const projeto = this.projetoRepository.create({
      proStrDescricao: dto.proStrDescricao,
      proDateInicio: dto.proDateInicio,
      proBoolAtivo: true,
      candidatura: candidatura ?? undefined,
    });

    return this.projetoRepository.save(projeto);
  }

  async update(id: number, dto: UpdateProjetoDto): Promise<Projeto> {
    const projeto = await this.findById(id);

    if (dto.proStrDescricao) projeto.proStrDescricao = dto.proStrDescricao;
    if (dto.proDateInicio) projeto.proDateInicio = dto.proDateInicio;

    if (dto.canIntId) {
      const candidatura = await this.candidaturaRepository.findOne({
        where: { canIntId: dto.canIntId },
      });
      if (!candidatura) {
        throw new HttpException(
          'A nova candidatura informada não existe',
          HttpStatus.NOT_FOUND,
        );
      }
      projeto.candidatura = candidatura;
    }

    return this.projetoRepository.save(projeto);
  }

  async delete(id: number): Promise<void> {
    const projeto = await this.findById(id);
    projeto.proBoolAtivo = false; // Soft delete mantido
    await this.projetoRepository.save(projeto);
  }
}
