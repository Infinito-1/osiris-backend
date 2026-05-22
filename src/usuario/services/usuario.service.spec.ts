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
      usuStrEmail: 'maria.silva@fatec.sp.gov.br',
      usuStrSenha: 'password123',
      usuStrTipo: 'Grupo',
    };

    it('deve cadastrar um usuário líder de grupo com e-mail institucional e disparar e-mail de confirmação', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null); // Nenhum e-mail duplicado
      
      const mockSavedUsuario = {
        usuIntId: 1,
        ...createDto,
        usuBoolAtivo: false,
        usuBoolConfirmado: false,
        usuStrTokenConfirmacao: 'mocked-token-123',
      };

      mockUsuarioRepository.create.mockReturnValue(mockSavedUsuario);
      mockUsuarioRepository.save.mockResolvedValue(mockSavedUsuario);

      // Espiona a geração do hash do bcrypt para garantir que ele aconteça
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
          'Líderes de grupo devem utilizar um e-mail institucional válido do CPS (ex: @aluno.cps.sp.gov.br, @fatec.sp.gov.br).',
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

  describe('confirmarEmail', () => {
    it('deve ativar a conta do usuário e retornar o redirecionamento correto para o painel de grupos', async () => {
      const mockUsuarioInativo = {
        usuIntId: 1,
        usuStrNome: 'Maria Silva',
        usuStrTipo: 'Grupo',
        usuBoolConfirmado: false,
        usuBoolAtivo: false,
        usuStrTokenConfirmacao: 'token-valido',
      };

      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuarioInativo);
      mockUsuarioRepository.save.mockResolvedValue({
        ...mockUsuarioInativo,
        usuBoolConfirmado: true,
        usuBoolAtivo: true,
        usuStrTokenConfirmacao: null,
      });

      const resultado = await service.confirmarEmail('token-valido');

      expect(resultado.statusCode).toBe(HttpStatus.OK);
      expect(resultado.redirectTo).toBe('/grupos/dashboard');
      expect(mockUsuarioInativo.usuBoolConfirmado).toBe(true);
      expect(mockUsuarioInativo.usuBoolAtivo).toBe(true);
    });
  });
});