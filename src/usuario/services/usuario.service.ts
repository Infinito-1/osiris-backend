import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { usuIntId: id } });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { usuStrEmail: email } });
  }

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.usuStrSenha, salt);

    const novoUsuario = this.usuarioRepository.create({
      ...dto,
      usuStrSenha: hashedPassword,
    });

    return this.usuarioRepository.save(novoUsuario);
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario | null> {
    const usuario = await this.findById(id);
    if (!usuario) return null;

    if (dto.usuStrSenha) {
      const salt = await bcrypt.genSalt();
      dto.usuStrSenha = await bcrypt.hash(dto.usuStrSenha, salt);
    }

    Object.assign(usuario, dto);
    return this.usuarioRepository.save(usuario);
  }

  async delete(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }
}
