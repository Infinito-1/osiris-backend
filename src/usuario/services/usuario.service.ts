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
      throw new HttpException('Email já cadastrado', HttpStatus.CONFLICT);
    }

    if (dto.usuStrTipo === 'Grupo') {
      const regex = /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
      if (!regex.test(dto.usuStrEmail)) {
        throw new HttpException('Grupo deve usar email institucional CPS', HttpStatus.BAD_REQUEST);
      }
    }

    if (dto.usuStrTipo === 'Coordenador' && requester?.role !== 'Admin') {
      throw new HttpException('Apenas admin pode criar coordenador', HttpStatus.FORBIDDEN);
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(dto.usuStrSenha, salt);
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    const usuario = this.usuarioRepository.create({
      ...dto,
      usuStrSenha: senhaHash,
      usuBoolAtivo: false,
      usuBoolConfirmado: false,
      codigo_ativacao: codigo,
    });

    const salvo = await this.usuarioRepository.save(usuario);

    // Envio de email com a entidade 'USUARIO' corrigida
    this.mailService.sendConfirmationEmail('USUARIO', salvo.usuStrEmail, codigo)
      .catch(err => this.logger.error(`Falha no envio de email para ${salvo.usuStrEmail}: ${err.message}`));

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
      throw new HttpException('Código de ativação inválido ou usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    usuario.usuBoolConfirmado = true;
    usuario.usuBoolAtivo = true;
    usuario.codigo_ativacao = undefined as any; // Cast necessário para evitar erro de tipo no TS

    await this.usuarioRepository.save(usuario);

    return {
      statusCode: HttpStatus.OK,
      message: 'Conta confirmada com sucesso!',
    };
  }

  async update(id: number, dto: UpdateUsuarioDto, requester: any): Promise<Usuario> {
    const usuario = await this.findById(id);
    if (requester.role !== 'Admin' && requester.id !== usuario.usuIntId) {
      throw new HttpException('Sem permissão', HttpStatus.FORBIDDEN);
    }
    
    Object.assign(usuario, dto);
    return this.usuarioRepository.save(usuario);
  }

  async delete(id: number, requester: any): Promise<void> {
    const usuario = await this.findById(id);
    usuario.usuBoolAtivo = false;
    await this.usuarioRepository.save(usuario);
  }
}