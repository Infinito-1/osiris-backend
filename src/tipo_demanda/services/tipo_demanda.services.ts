/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoDemanda } from '../entities/tipo_demanda.entity';
import { ILike, In, Repository } from 'typeorm';
import { CreateTipoDemandaDto } from '../dto/create-tipo-demanda.dto';
import { UpdateTipoDemandaDto } from '../dto/update-tipo-demanda.dto';

@Injectable()
export class TipoDemandaService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(TipoDemanda)
    private tipoDemandaRepository: Repository<TipoDemanda>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed(): Promise<void> {
    const count = await this.tipoDemandaRepository.count();
    if (count > 0) return;

    await this.tipoDemandaRepository.save([
      { tipStrNome: 'Sistema Web' },
      { tipStrNome: 'Aplicativo Mobile' },
      { tipStrNome: 'Landing Page' },
      { tipStrNome: 'E-commerce' },
    ]);
  }

  async findAll(): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find();
  }

  async findById(id: number): Promise<TipoDemanda | null> {
    return await this.tipoDemandaRepository.findOne({
      where: { tipIntId: id },
    });
  }

  async findByName(tipStrNome: string): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      where: { tipStrNome: ILike(`%${tipStrNome}%`) },
      relations: { demandas: true },
    });
  }

  async findComDemandas(ids: number[]): Promise<TipoDemanda[]> {
    return await this.tipoDemandaRepository.find({
      where: { tipIntId: In(ids) },
      relations: { demandas: true },
    });
  }

  async create(dto: CreateTipoDemandaDto): Promise<TipoDemanda> {
    const tipo = this.tipoDemandaRepository.create(dto);
    return await this.tipoDemandaRepository.save(tipo);
  }

  async update(id: number, dto: UpdateTipoDemandaDto): Promise<TipoDemanda> {
    const tipo = await this.findById(id);
    if (!tipo) throw new HttpException('Tipo de demanda não encontrado', HttpStatus.NOT_FOUND);

    if (dto.tipStrNome) tipo.tipStrNome = dto.tipStrNome;

    return await this.tipoDemandaRepository.save(tipo);
  }

  // 🔧 Novo método para criar automaticamente se não existir
  async findOrCreate(nome: string): Promise<TipoDemanda> {
    let tipo = await this.tipoDemandaRepository.findOne({ where: { tipStrNome: nome } });
    if (!tipo) {
      tipo = this.tipoDemandaRepository.create({ tipStrNome: nome });
      tipo = await this.tipoDemandaRepository.save(tipo);
    }
    return tipo;
  }
}
