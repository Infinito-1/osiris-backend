import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findById(id: number): Promise<Usuario | undefined> {
    return this.usuarioRepository.findOne({ where: { usu_int_id: id } });
  }

  async create(usuario: Usuario): Promise<Usuario> {
    return this.usuarioRepository.save(usuario);
  }

  async update(id: number, usuario: Usuario): Promise<Usuario | undefined> {
    await this.usuarioRepository.update(id, usuario);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }
}
