import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../entities/usuario.entity';
import { MailService } from '../../mail/mail.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: Repository<Usuario>;
  let mailService: MailService;

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockMailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepository },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateUsuarioDto = {
      usuStrNome: 'Maria Silva',
      usuStrEmail: 'maria.silva@aluno.cps.sp.gov.br',
      usuStrSenha: 'password123',
      usuStrTipo: 'Grupo',
      usuStrTelefone: '11999999999'
    };

    it('deve cadastrar um usuário e disparar e-mail de confirmação', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);
      
      const mockSavedUsuario = {
        usuIntId: 1,
        ...createDto,
        usuBoolAtivo: false,
        usuBoolConfirmado: false,
        codigo_ativacao: '123456',
      };

      mockUsuarioRepository.create.mockReturnValue(mockSavedUsuario);
      mockUsuarioRepository.save.mockResolvedValue(mockSavedUsuario);

      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed_password');

      const resultado = await service.create(createDto);

      expect(resultado.statusCode).toBe(HttpStatus.CREATED);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { usuStrEmail: createDto.usuStrEmail } });
      expect(mailService.sendConfirmationEmail).toHaveBeenCalledWith(createDto.usuStrEmail, 'mocked-token-123');
    });

    it('deve lançar erro 409 (CONFLICT) se o e-mail já estiver cadastrado no banco do Osiris', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue({ usuIntId: 1, ...createDto });

      await expect(service.create(createDto)).rejects.toThrow(
        new HttpException('Email já cadastrado', HttpStatus.CONFLICT),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro 400 (BAD_REQUEST) se um usuário do tipo Grupo tentar se cadastrar com e-mail não institucional', async () => {
      const dtoInvalido: CreateUsuarioDto = {
        ...createDto,
        usuStrEmail: 'maria.silva@gmail.com',
        usuStrTipo: 'Grupo',
      };

      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dtoInvalido)).rejects.toThrow(
        new HttpException(
          'Líderes de grupo devem utilizar um e-mail institucional válido do CPS (ex: @aluno.cps.sp.gov.br).',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('deve lançar erro 403 (FORBIDDEN) se um usuário comum (não Admin) tentar criar um perfil de Coordenador', async () => {
      const dtoCoordenador: CreateUsuarioDto = {
        ...createDto,
        usuStrTipo: 'Coordenador',
      };

      mockUsuarioRepository.findOne.mockResolvedValue(null);
      const requester = { id: 2, role: 'Aluno' }; // Não é administrador

      await expect(service.create(dtoCoordenador, requester)).rejects.toThrow(
        new HttpException(
          'Apenas administradores do sistema podem criar contas do tipo Coordenador.',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
  });

  describe('confirmarCodigo', () => {
    it('deve ativar a conta do usuário corretamente', async () => {
      const mockUsuarioInativo = {
        usuIntId: 1,
        codigo_ativacao: '221003',
        usuBoolConfirmado: false,
        usuBoolAtivo: false,
      };

      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuarioInativo);
      mockUsuarioRepository.save.mockResolvedValue({
        ...mockUsuarioInativo,
        usuBoolConfirmado: true,
        usuBoolAtivo: true,
        codigo_ativacao: undefined,
      });

      // Passamos o email vazio '' pois o método no service recebe (email, codigo)
      const resultado = await service.confirmarCodigo('', '221003');

      expect(resultado.statusCode).toBe(HttpStatus.OK);
      expect(resultado.message).toBe('Conta confirmada com sucesso!');
      expect(mockUsuarioInativo.usuBoolConfirmado).toBe(true);
    });

    it('deve lançar erro 404 se o código for inválido', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.confirmarCodigo('', '000000')).rejects.toThrow(
        new HttpException('Código de ativação inválido ou usuário não encontrado', HttpStatus.NOT_FOUND),
      );
    });
  });
});