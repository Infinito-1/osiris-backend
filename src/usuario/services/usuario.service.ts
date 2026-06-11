/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly mailService: MailService,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ where: { usuBoolAtivo: true } });
  }

  async findById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: id },
    });
    if (!usuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { usuStrEmail: email },
    });
  }

  async create(dto: CreateUsuarioDto, requester?: any): Promise<any> {
    const existing = await this.findByEmail(dto.usuStrEmail);

    if (existing) {
      if (existing.usuBoolConfirmado) {
        throw new HttpException('Email já cadastrado', HttpStatus.CONFLICT);
      }
      await this.usuarioRepository.delete(existing.usuIntId);
    }

    if (dto.usuStrTipo === 'Grupo') {
      const emailInstitucionalRegex =
        /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
      if (!emailInstitucionalRegex.test(dto.usuStrEmail)) {
        throw new HttpException(
          'Líderes de grupo devem utilizar um e-mail institucional válido do CPS (ex: @aluno.cps.sp.gov.br).',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Regra: Apenas Admin cria Coordenador
    if (dto.usuStrTipo === 'Coordenador') {
      if (!requester || requester.role !== 'Admin') {
        throw new HttpException(
          'Apenas administradores podem criar contas do tipo Coordenador.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(dto.usuStrSenha, salt);
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    const criadoPorAdmin = requester?.role === 'Admin';

    // const novoUsuario = this.usuarioRepository.create({
    //   ...dto,
    //   usuStrSenha: senhaHash,
    //   usuBoolAtivo: criadoPorAdmin ? true : false, // Fica inativo até confirmar por e-mail se não for criado por admin
    //   usuBoolConfirmado: criadoPorAdmin ? true : false,
    //   codigo_ativacao: criadoPorAdmin ? null : codigo,
    // });

    // const salvo = await this.usuarioRepository.save(novoUsuario);

    const novoUsuario = this.usuarioRepository.create({
      usuStrNome: dto.usuStrNome,
      usuStrEmail: dto.usuStrEmail,
      usuStrSenha: senhaHash,
      usuStrTipo: dto.usuStrTipo,
      usuStrTelefone: dto.usuStrTelefone,
      usuBoolAtivo: criadoPorAdmin,
      usuBoolConfirmado: criadoPorAdmin,
      codigo_ativacao: criadoPorAdmin ? undefined : codigo, // null → undefined
    });
    const salvo = (await this.usuarioRepository.save(novoUsuario)) as Usuario; // as Usuario

    // Envio de email com a entidade 'USUARIO' corrigida
    if (!criadoPorAdmin) {
      this.mailService
        .sendConfirmationEmail('USUARIO', salvo.usuStrEmail, codigo)
        .catch((err) =>
          this.logger.error(
            `Falha no envio de email para ${salvo.usuStrEmail}: ${err.message}`,
          ),
        );
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Usuário criado. Verifique seu email.',
      dados: { id: salvo.usuIntId, email: salvo.usuStrEmail },
    };
  }

  async confirmarCodigo(email: string, codigo: string): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { codigo_ativacao: codigo },
    });

    if (!usuario) {
      throw new HttpException(
        'Código de ativação inválido ou usuário não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    usuario.usuBoolConfirmado = true;
    usuario.usuBoolAtivo = true;
    usuario.codigo_ativacao = undefined as any; // Cast necessário para evitar erro de tipo no TS

    await this.usuarioRepository.save(usuario);

    let rotaRedirecionamento = '/grupos/dashboard';
    if (usuario.usuStrTipo === 'Empreendedor')
      rotaRedirecionamento = '/empreendedores/dashboard';
    if (usuario.usuStrTipo === 'Coordenador')
      rotaRedirecionamento = '/coordenadores/dashboard';
    if (usuario.usuStrTipo === 'Admin')
      rotaRedirecionamento = '/admin/dashboard';

    return {
      statusCode: HttpStatus.OK,
      message: 'Conta confirmada com sucesso!',
    };
  }

  async update(
    id: number,
    dto: UpdateUsuarioDto,
    requester: any,
  ): Promise<Usuario> {
    const usuario = await this.findById(id);
    if (requester.role !== 'Admin' && requester.id !== usuario.usuIntId) {
      throw new HttpException(
        'Acesso negado: Você não possui permissão para alterar o perfil de outro usuário.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (dto.usuStrTipo === 'Coordenador' || dto.usuStrTipo === 'Admin') {
      if (!requester || requester.role !== 'Admin') {
        throw new HttpException(
          'Apenas administradores podem criar contas do tipo Coordenador ou Administrador.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    if (dto.usuStrEmail && dto.usuStrEmail !== usuario.usuStrEmail) {
      if (usuario.usuStrTipo === 'Grupo' || dto.usuStrTipo === 'Grupo') {
        const emailInstitucionalRegex =
          /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
        if (!emailInstitucionalRegex.test(dto.usuStrEmail)) {
          throw new HttpException(
            'O novo e-mail para perfis de Grupo deve ser institucional do CPS.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const emailExist = await this.findByEmail(dto.usuStrEmail);
      if (emailExist) {
        throw new HttpException(
          'Este email já está sendo utilizado por outro usuário',
          HttpStatus.CONFLICT,
        );
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
      throw new HttpException(
        'Operação cancelada: Um administrador não pode inativar a própria conta ativa.',
        HttpStatus.FORBIDDEN,
      );
    }

    usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(usuario);
  }
}
