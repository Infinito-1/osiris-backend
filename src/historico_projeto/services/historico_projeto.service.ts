import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';
import { CreateHistoricoProjetoDto } from '../dto/create-historico-projeto.dto';
import { UpdateHistoricoProjetoDto } from '../dto/update-historico-projeto.dto';

@Injectable()
export class HistoricoProjetoService {
  constructor(
    @InjectRepository(HistoricoProjeto)
    private readonly historicoProjetoRepository: Repository<HistoricoProjeto>,
  ) {}

  async findAll(): Promise<HistoricoProjeto[]> {
    return this.historicoProjetoRepository.find({ relations: ['projeto'] });
  }

  async findById(id: number): Promise<HistoricoProjeto> {
    const historico = await this.historicoProjetoRepository.findOne({
      where: { hspIntId: id },
      relations: ['projeto'],
    });
    if (!historico) {
      throw new HttpException('Registro de histórico não encontrado', HttpStatus.NOT_FOUND);
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
    const historico = this.historicoProjetoRepository.create({
      hspStrDesc: dto.hspStrDesc,
      hspStrLinkProjeto: dto.hspStrLinkProjeto,
      hspStrStatus: dto.hspStrStatus,
      projeto: { proIntId: dto.proIntId } as any,
    });
    return this.historicoProjetoRepository.save(historico);
  }

  async update(id: number, dto: UpdateHistoricoProjetoDto): Promise<HistoricoProjeto> {
    const historico = await this.findById(id);

    if (dto.hspStrDesc) historico.hspStrDesc = dto.hspStrDesc;
    if (dto.hspStrLinkProjeto) historico.hspStrLinkProjeto = dto.hspStrLinkProjeto;
    if (dto.hspStrStatus) historico.hspStrStatus = dto.hspStrStatus;
    if (dto.proIntId) historico.projeto = { proIntId: dto.proIntId } as any;

    return this.historicoProjetoRepository.save(historico);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.historicoProjetoRepository.delete(id);
  }
}