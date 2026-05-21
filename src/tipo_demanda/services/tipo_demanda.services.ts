import { Injectable, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { TipoDemanda } from '../entities/tipo_demanda.entity';
import { CreateTipoDemandaDto } from '../dto/create-tipo-demanda.dto';
import { UpdateTipoDemandaDto } from '../dto/update-tipo-demanda.dto';

@Injectable()
export class TipoDemandaService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(TipoDemanda)
    private readonly tipoDemandaRepository: Repository<TipoDemanda>,
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
    return this.tipoDemandaRepository.find();
  }

  async findById(id: number): Promise<TipoDemanda> {
    const tipo = await this.tipoDemandaRepository.findOne({
      where: { tipIntId: id },
    });
    if (!tipo) {
      throw new HttpException('Tipo de demanda não encontrado.', HttpStatus.NOT_FOUND);
    }
    return tipo;
  }

  async findByName(tipStrNome: string): Promise<TipoDemanda[]> {
    return this.tipoDemandaRepository.find({
      where: { tipStrNome: ILike(`%${tipStrNome}%`) },
      // 💡 Removido relations direto para evitar loop circular infinito com a entidade Demanda
    });
  }

  async findComDemandas(ids: number[]): Promise<TipoDemanda[]> {
    if (!ids || ids.length === 0) {
      throw new HttpException('Identificadores de tipos de demanda não foram fornecidos', HttpStatus.BAD_REQUEST);
    }

    // 💡 Ao carregar demandas vinculadas, certifique-se de tratar a paginação/exibição no frontend
    return this.tipoDemandaRepository.find({
      where: { tipIntId: In(ids) },
      relations: ['demandas'], 
    });
  }

  async create(dto: CreateTipoDemandaDto): Promise<TipoDemanda> {
    const exist = await this.tipoDemandaRepository.findOne({
      where: { tipStrNome: dto.tipStrNome }
    });
    if (exist) {
      throw new HttpException('Já existe um tipo de demanda cadastrado com este nome', HttpStatus.CONFLICT);
    }

    const tipo = this.tipoDemandaRepository.create(dto);
    return this.tipoDemandaRepository.save(tipo);
  }

  async update(id: number, dto: UpdateTipoDemandaDto): Promise<TipoDemanda> {
    const tipo = await this.findById(id);

    if (dto.tipStrNome && dto.tipStrNome.trim() !== '') {
      const exist = await this.tipoDemandaRepository.findOne({
        where: { tipStrNome: dto.tipStrNome }
      });
      if (exist && exist.tipIntId !== id) {
        throw new HttpException('Já existe outra categoria com este nome cadastrada', HttpStatus.CONFLICT);
      }
      tipo.tipStrNome = dto.tipStrNome;
    } else {
      throw new HttpException('O nome informado para atualização não pode estar vazio', HttpStatus.BAD_REQUEST);
    }

    return this.tipoDemandaRepository.save(tipo);
  }

  async findOrCreate(nome: string): Promise<TipoDemanda> {
    let tipo = await this.tipoDemandaRepository.findOne({
      where: { tipStrNome: nome }
    });
    if (!tipo) {
      tipo = this.tipoDemandaRepository.create({ tipStrNome: nome });
      tipo = await this.tipoDemandaRepository.save(tipo);
    }
    return tipo;
  }
}