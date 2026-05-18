import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    return this.usuarioRepository.find({ where: { usuBoolAtivo: true } });
  }

  async findById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: id } });
    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { usuStrEmail: email } });
  }

  async create(dto: CreateUsuarioDto): Promise<any> {
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

    const usuarioSalvo = await this.usuarioRepository.save(novoUsuario);

    let rotaRedirecionamento = '/grupos/dashboard';
    if (usuarioSalvo.usuStrTipo === 'Empreendedor') rotaRedirecionamento = '/empreendedores/dashboard';
    if (usuarioSalvo.usuStrTipo === 'Coordenador') rotaRedirecionamento = '/coordenadores/dashboard';
    if (usuarioSalvo.usuStrTipo === 'Admin') rotaRedirecionamento = '/admin/dashboard';

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Usuário cadastrado com sucesso no Osiris!',
      redirectTo: rotaRedirecionamento,
      dados: {
        id: usuarioSalvo.usuIntId,
        nome: usuarioSalvo.usuStrNome,
        email: usuarioSalvo.usuStrEmail,
        tipo: usuarioSalvo.usuStrTipo,
      }
    };
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findById(id);

    if (dto.usuStrEmail && dto.usuStrEmail !== usuario.usuStrEmail) {
      const emailExist = await this.findByEmail(dto.usuStrEmail);
      if (emailExist) {
        throw new HttpException('Este email já está sendo utilizado por outro usuário', HttpStatus.CONFLICT);
      }
      usuario.usuStrEmail = dto.usuStrEmail;
    }

    if (dto.usuStrSenha) {
      const salt = await bcrypt.genSalt(10);
      usuario.usuStrSenha = await bcrypt.hash(dto.usuStrSenha, salt);
    }

    if (dto.usuStrNome) usuario.usuStrNome = dto.usuStrNome;
    if (dto.usuStrTelefone) usuario.usuStrTelefone = dto.usuStrTelefone;
    if (dto.usuStrTipo) usuario.usuStrTipo = dto.usuStrTipo;

    return this.usuarioRepository.save(usuario);
  }

  async delete(id: number): Promise<void> {
    const usuario = await this.findById(id);

    if (usuario.usuStrTipo === 'Admin') {
      throw new HttpException('Não é permitido inativar administradores do sistema', HttpStatus.FORBIDDEN);
    }

    usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(usuario);
  }
}