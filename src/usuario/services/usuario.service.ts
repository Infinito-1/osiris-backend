import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
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
    // Verifica se já existe usuário com o mesmo email
    const existing = await this.findByEmail(dto.usuStrEmail);
    if (existing) {
      throw new HttpException('Email já cadastrado', HttpStatus.CONFLICT);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.usuStrSenha, salt);

    const novoUsuario = this.usuarioRepository.create({
      ...dto,
      usuStrSenha: hashedPassword,
    });

    return this.usuarioRepository.save(novoUsuario);
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario | null> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    // Se senha foi informada, gera novo hash
    if (dto.usuStrSenha) {
      const salt = await bcrypt.genSalt(10);
      dto.usuStrSenha = await bcrypt.hash(dto.usuStrSenha, salt);
    }

    Object.assign(usuario, dto);
    return this.usuarioRepository.save(usuario);
  }

  async delete(id: number): Promise<void> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    await this.usuarioRepository.delete(id);
  }
}
