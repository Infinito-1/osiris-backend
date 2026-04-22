import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empreendedor } from '../entities/empreendedor.entity';

@Injectable()
export class EmpreendedorService {
  constructor(
    @InjectRepository(Empreendedor)
    private readonly empreendedorRepository: Repository<Empreendedor>,
  ) {}

  async findAll(): Promise<Empreendedor[]> {
    return this.empreendedorRepository.find();
  }

  async findById(id: number): Promise<Empreendedor | null> {
    return this.empreendedorRepository.findOne({ where: { empIntId: id } });
  }

  async findByEmpresa(empresa: string): Promise<Empreendedor[]> {
    return this.empreendedorRepository.find({ where: { empStrEmpresa: empresa } });
  }

  async create(empreendedor: Empreendedor): Promise<Empreendedor> {
    return this.empreendedorRepository.save(empreendedor);
  }

  async update(empreendedor: Empreendedor): Promise<Empreendedor> {
    return this.empreendedorRepository.save(empreendedor);
  }

  async delete(id: number) {
    return this.empreendedorRepository.delete(id);
  }
}
