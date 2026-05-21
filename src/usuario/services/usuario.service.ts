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

  async create(dto: CreateUsuarioDto, requester?: any): Promise<any> {
    const existing = await this.findByEmail(dto.usuStrEmail);
    if (existing) {
      throw new HttpException('Email já cadastrado', HttpStatus.CONFLICT);
    }

    if (dto.usuStrTipo === 'Grupo') {
      const emailInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
      if (!emailInstitucionalRegex.test(dto.usuStrEmail)) {
        throw new HttpException(
          'Líderes de grupo devem utilizar um e-mail institucional válido do CPS (ex: @aluno.cps.sp.gov.br, @fatec.sp.gov.br).',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.usuStrTipo === 'Coordenador' && requester?.role !== 'Admin') {
      throw new HttpException(
        'Apenas administradores do sistema podem criar contas do tipo Coordenador.',
        HttpStatus.FORBIDDEN,
      );
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

  async update(id: number, dto: UpdateUsuarioDto, requester: any): Promise<Usuario> {
    const usuario = await this.findById(id);

    if (requester.role !== 'Admin' && requester.id !== usuario.usuIntId) {
      throw new HttpException(
        'Acesso negado: Você não possui permissão para alterar o perfil de outro usuário.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (dto.usuStrTipo && (dto.usuStrTipo === 'Coordenador' || (dto.usuStrTipo as string) === 'Admin') && requester.role !== 'Admin') {
      throw new HttpException(
        'Somente administradores podem atribuir papéis de nível administrativo.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (dto.usuStrEmail && dto.usuStrEmail !== usuario.usuStrEmail) {
      if (usuario.usuStrTipo === 'Grupo' || dto.usuStrTipo === 'Grupo') {
        const emailInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
        if (!emailInstitucionalRegex.test(dto.usuStrEmail)) {
          throw new HttpException('O novo e-mail para perfis de Grupo deve ser institucional do CPS.', HttpStatus.BAD_REQUEST);
        }
      }

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

  async delete(id: number, requester: any): Promise<void> {
    const usuario = await this.findById(id);

    if (usuario.usuStrTipo === 'Admin' && requester.id === usuario.usuIntId) {
      throw new HttpException('Operação cancelada: Um administrador não pode inativar a própria conta ativa.', HttpStatus.FORBIDDEN);
    }

    usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(usuario);
  }
}