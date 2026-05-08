import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empreendedor } from '../entities/empreendedor.entity';
import { CreateEmpreendedorDto } from '../dto/create-empreendedor.dto';
import { UpdateEmpreendedorDto } from '../dto/update-empreendedor.dto';

@Injectable()
export class EmpreendedorService {
  constructor(
    @InjectRepository(Empreendedor)
    private readonly empreendedorRepository: Repository<Empreendedor>,
  ) {}

  async findAll(): Promise<Empreendedor[]> {
    return this.empreendedorRepository.find({ relations: ['usuario'] });
  }

  async findById(id: number): Promise<Empreendedor | null> {
    return this.empreendedorRepository.findOne({
      where: { empIntId: id },
      relations: ['usuario'],
    });
  }

  async findByEmpresa(empresa: string): Promise<Empreendedor[]> {
    return this.empreendedorRepository.find({
      where: { empStrEmpresa: empresa },
      relations: ['usuario'],
    });
  }

  async create(dto: CreateEmpreendedorDto): Promise<Empreendedor> {
    const empreendedor = this.empreendedorRepository.create({
      ...dto,
      usuario: { usuIntId: dto.usuIntId } as any, // FK para Usuario
    });
    return this.empreendedorRepository.save(empreendedor);
  }

  async update(id: number, dto: UpdateEmpreendedorDto): Promise<Empreendedor | null> {
    const empreendedor = await this.findById(id);
    if (!empreendedor) return null;

    Object.assign(empreendedor, dto);
    if (dto.usuIntId) {
      empreendedor.usuario = { usuIntId: dto.usuIntId } as any;
    }

    return this.empreendedorRepository.save(empreendedor);
  }

  async delete(id: number) {
    return this.empreendedorRepository.delete(id);
  }
}
