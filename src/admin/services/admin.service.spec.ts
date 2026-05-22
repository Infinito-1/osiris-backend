import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Admin } from '../entities/admin.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Projeto } from '../../projeto/entities/projeto.entity';
import { MailService } from '../../mail/mail.service';

describe('AdminService', () => {
  let service: AdminService;
  let usuarioRepository: Repository<Usuario>;
  let adminRepository: Repository<Admin>;
  let demandaRepository: Repository<Demanda>;
  let projetoRepository: Repository<Projeto>;
  let mailService: MailService;

  const mockRepositoryFactory = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  });

  const mockMailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Admin), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(Usuario), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(Demanda), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(Projeto), useFactory: mockRepositoryFactory },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    demandaRepository = module.get<Repository<Demanda>>(getRepositoryToken(Demanda));
    projetoRepository = module.get<Repository<Projeto>>(getRepositoryToken(Projeto));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('criarAdmin', () => {
    it('deve promover um usuário a administrador com sucesso', async () => {
      const mockUsuario = { usuIntId: 1, usuStrEmail: 'admin@osiris.com', usuStrTipo: 'Grupo' } as Usuario;
      const mockAdmin = { admIntId: 1, usuario: mockUsuario, admBoolAtivo: true } as Admin;

      jest.spyOn(usuarioRepository, 'findOne').mockResolvedValue(mockUsuario);
      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(usuarioRepository, 'save').mockResolvedValue(mockUsuario);
      jest.spyOn(adminRepository, 'create').mockReturnValue(mockAdmin);
      jest.spyOn(adminRepository, 'save').mockResolvedValue(mockAdmin);

      const resultado = await service.criarAdmin({ usuarioId: 1 });

      expect(resultado).toBeDefined();
      expect(mockUsuario.usuStrTipo).toBe('Admin');
      expect(mailService.sendConfirmationEmail).toHaveBeenCalledWith('admin@osiris.com', expect.any(String));
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      jest.spyOn(usuarioRepository, 'findOne').mockResolvedValue(null);

      await expect(service.criarAdmin({ usuarioId: 999 })).rejects.toThrow(
        new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('atualizarPapel', () => {
    it('deve alterar o papel para Grupo se o e-mail for institucional CPS (RN-19)', async () => {
      const mockUsuario = { usuIntId: 2, usuStrEmail: 'aluno@fatec.sp.gov.br', usuStrTipo: 'Empreendedor' } as Usuario;
      jest.spyOn(usuarioRepository, 'findOne').mockResolvedValue(mockUsuario);
      jest.spyOn(usuarioRepository, 'save').mockResolvedValue({ ...mockUsuario, usuStrTipo: 'Grupo' } as Usuario);

      const resultado = await service.atualizarPapel(2, { novoPapel: 'Grupo' });

      expect(resultado.usuStrTipo).toBe('Grupo');
    });

    it('deve barrar a alteração para Grupo se o e-mail não for institucional (RN-19)', async () => {
      const mockUsuario = { usuIntId: 3, usuStrEmail: 'usuario@gmail.com', usuStrTipo: 'Empreendedor' } as Usuario;
      jest.spyOn(usuarioRepository, 'findOne').mockResolvedValue(mockUsuario);

      await expect(service.atualizarPapel(3, { novoPapel: 'Grupo' })).rejects.toThrow(
        new HttpException(
          'Incompatibilidade de papel: O usuário alvo não possui um e-mail institucional CPS válido para se tornar um perfil Grupo.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('inativarAdmin', () => {
    it('deve impedir que um administrador inative a si mesmo', async () => {
      const mockUsuario = { usuIntId: 10 } as Usuario;
      const mockAdmin = { admIntId: 1, usuario: mockUsuario } as Admin;
      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(mockAdmin);

      await expect(service.inativarAdmin(1, 10)).rejects.toThrow(
        new HttpException('Não é permitido inativar a sua própria conta de administrador', HttpStatus.FORBIDDEN),
      );
    });

    it('deve impedir a inativação se for o único administrador ativo do sistema', async () => {
      const mockUsuario = { usuIntId: 11 } as Usuario;
      const mockAdmin = { admIntId: 2, usuario: mockUsuario, admBoolAtivo: true } as Admin;
      
      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(adminRepository, 'count').mockResolvedValue(1);

      await expect(service.inativarAdmin(2, 10)).rejects.toThrow(
        new HttpException('Não é permitido remover ou inativar o único administrador ativo do sistema', HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('reativarAdmin', () => {
    it('deve reativar um administrador com sucesso', async () => {
      const mockUsuario = { usuIntId: 12, usuStrEmail: 'reativado@cps.sp.gov.br', usuStrTipo: 'Admin' } as Usuario;
      const mockAdmin = { admIntId: 3, usuario: mockUsuario, admBoolAtivo: false } as Admin;

      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(adminRepository, 'save').mockResolvedValue({ ...mockAdmin, admBoolAtivo: true } as Admin);
      jest.spyOn(usuarioRepository, 'save').mockResolvedValue(mockUsuario);

      const resultado = await service.reativarAdmin(3);
      expect(resultado.admBoolAtivo).toBe(true);
    });
  });

  describe('moderarEOmitirDemanda', () => {
    it('deve suspender a demanda se o parecer técnico estiver preenchido com sucesso', async () => {
      const mockDemanda = { demIntId: 5, demBoolAtivo: true } as Demanda;
      jest.spyOn(demandaRepository, 'findOne').mockResolvedValue(mockDemanda);
      jest.spyOn(demandaRepository, 'save').mockResolvedValue({ ...mockDemanda, demBoolAtivo: false } as Demanda);

      const resultado = await service.moderarEOmitirDemanda(5, 'Conteúdo impróprio detectado');
      expect(resultado.demBoolAtivo).toBe(false);
    });

    it('deve lançar um erro se o parecer técnico não for preenchido', async () => {
      await expect(service.moderarEOmitirDemanda(1, '')).rejects.toThrow(
        new HttpException('Moderação bloqueada: É obrigatório o preenchimento do parecer técnico justificando a ação', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('getEstatisticas', () => {
    it('deve consolidar as contagens das entidades do ecossistema', async () => {
      jest.spyOn(usuarioRepository, 'count').mockResolvedValue(50);
      jest.spyOn(demandaRepository, 'count').mockResolvedValue(20);
      jest.spyOn(projetoRepository, 'count').mockResolvedValue(10);
      jest.spyOn(adminRepository, 'count').mockResolvedValue(3);

      const resultado = await service.getEstatisticas();

      expect(resultado).toEqual({
        totalUsuarios: 50,
        totalDemandas: 20,
        totalProjetos: 10,
        totalAdmins: 3,
        timestamp: expect.any(String),
      });
    });
  });
});