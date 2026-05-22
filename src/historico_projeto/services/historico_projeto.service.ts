import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';
import { Projeto } from '../../projeto/entities/projeto.entity';
import { CreateHistoricoProjetoDto } from '../dto/create-historico-projeto.dto';
import { UpdateHistoricoProjetoDto } from '../dto/update-historico-projeto.dto';

@Injectable()
export class HistoricoProjetoService {
  constructor(
    @InjectRepository(HistoricoProjeto)
    private readonly historicoProjetoRepository: Repository<HistoricoProjeto>,
    
    @InjectRepository(Projeto) 
    private readonly projetoRepository: Repository<Projeto>,
  ) {}

  async findAll(): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoRepository.find({ 
      relations: ['projeto', 'projeto.candidatura'] 
    });
  }

  async findById(id: number): Promise<HistoricoProjeto> {
    const historico = await this.historicoProjetoRepository.findOne({
      where: { hspIntId: id },
      relations: ['projeto'],
    });
    if (!historico) {
      throw new HttpException('Registro de histórico do projeto não encontrado no Osiris', HttpStatus.NOT_FOUND);
    }
    return historico;
  }

  async findByhspStrDesc(hspStrDesc: string): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoRepository.find({
      where: { hspStrDesc: ILike(`%${hspStrDesc}%`) },
      relations: ['projeto'],
    });
  }

  async create(dto: CreateHistoricoProjetoDto): Promise<HistoricoProjeto> {
    // 1. 🔒 VALIDAÇÃO DE SEGURANÇA: Garante a existência do projeto antes de vincular
    const projeto = await this.projetoRepository.findOne({
      where: { proIntId: dto.proIntId, proBoolAtivo: true }
    });

    if (!projeto) {
      throw new HttpException('Não é possível criar o histórico. Projeto associado não encontrado ou está inativo.', HttpStatus.NOT_FOUND);
    }

    // 2. Criação limpa associando o objeto completo da entidade projeto
    const historico = this.historicoProjetoRepository.create({
      hspStrDesc: dto.hspStrDesc,
      hspStrLinkProjeto: dto.hspStrLinkProjeto,
      hspStrStatus: dto.hspStrStatus,
      projeto: projeto,
    });

    return this.historicoProjetoRepository.save(historico);
  }

  async update(id: number, dto: UpdateHistoricoProjetoDto): Promise<HistoricoProjeto> {
    const historico = await this.findById(id);

    if (dto.hspStrDesc) historico.hspStrDesc = dto.hspStrDesc;
    if (dto.hspStrLinkProjeto) historico.hspStrLinkProjeto = dto.hspStrLinkProjeto;
    if (dto.hspStrStatus) historico.hspStrStatus = dto.hspStrStatus;
    
    if (dto.proIntId) {
      const projeto = await this.projetoRepository.findOne({
        where: { proIntId: dto.proIntId }
      });
      if (!projeto) {
        throw new HttpException('O novo projeto informado para este histórico não existe', HttpStatus.NOT_FOUND);
      }
      historico.projeto = projeto;
    }

    return this.historicoProjetoRepository.save(historico);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.historicoProjetoRepository.delete(id);
  }
}