import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GrupoService } from './grupo.service';
import { Grupo } from '../entities/grupo.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { MailService } from '../../mail/mail.service';
import { CreateGrupoDto } from '../dto/create-grupo.dto';

describe('GrupoService', () => {
  let service: GrupoService;
  let grupoRepository: Repository<Grupo>;
  let usuarioRepository: Repository<Usuario>;
  let demandaRepository: Repository<Demanda>;
  let candidaturaRepository: Repository<Candidatura>;
  let mailService: MailService;

  // Mocks dos Repositórios e Serviços externos
  const mockGrupoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockDemandaRepository = {
    findOne: jest.fn(),
  };

  const mockCandidaturaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMailService = {
    sendStatusCandidaturaEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrupoService,
        { provide: getRepositoryToken(Grupo), useValue: mockGrupoRepository },
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepository },
        { provide: getRepositoryToken(Demanda), useValue: mockDemandaRepository },
        { provide: getRepositoryToken(Candidatura), useValue: mockCandidaturaRepository },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<GrupoService>(GrupoService);
    grupoRepository = module.get<Repository<Grupo>>(getRepositoryToken(Grupo));
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    demandaRepository = module.get<Repository<Demanda>>(getRepositoryToken(Demanda));
    candidaturaRepository = module.get<Repository<Candidatura>>(getRepositoryToken(Candidatura));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (Fluxo de Cadastro de Grupo)', () => {
    const createDto: CreateGrupoDto = {
      gruStrNome: 'Grupo Osiris Test',
      gruStrDescricao: 'Análise de dados acadêmicos',
      gruStrLider: 'Deyse Soares',
      gruChaRa: '1234567890123',
      gruIntTamanho: 4,
      usuIntId: 1,
    };

    it('deve criar um grupo com sucesso quando o e-mail for institucional da Fatec', async () => {
      const mockUsuario = { 
        usuIntId: 1, 
        usuStrEmail: 'deyse.soares@fatec.sp.gov.br', 
        usuStrTipo: 'Aluno' 
      };
      
      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuario);
      mockUsuarioRepository.save.mockResolvedValue({ ...mockUsuario, constTipo: 'Grupo' });
      mockGrupoRepository.create.mockReturnValue(createDto);
      mockGrupoRepository.save.mockResolvedValue({ gruIntId: 1, ...createDto });

      const resultado = await service.create(createDto);

      expect(resultado).toBeDefined();
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({ where: { usuIntId: createDto.usuIntId } });
      expect(mockGrupoRepository.save).toHaveBeenCalled();
    });

    it('deve criar um grupo com sucesso quando o e-mail for institucional do CPS', async () => {
      const mockUsuario = { 
        usuIntId: 1, 
        usuStrEmail: 'test@aluno.cps.sp.gov.br', 
        usuStrTipo: 'Aluno' 
      };
      
      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuario);
      mockGrupoRepository.create.mockReturnValue(createDto);
      mockGrupoRepository.save.mockResolvedValue({ gruIntId: 1, ...createDto });

      const resultado = await service.create(createDto);
      expect(resultado).toBeDefined();
    });

    it('deve lançar erro 400 (BAD_REQUEST) se o e-mail for pessoal (ex: Gmail)', async () => {
      const mockUsuarioErrado = { 
        usuIntId: 1, 
        usuStrEmail: 'deysesres@gmail.com', 
        usuStrTipo: 'Aluno' 
      };
      
      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuarioErrado);

      await expect(service.create(createDto)).rejects.toThrow(
        new HttpException(
          'Apenas contas vinculadas ao E-mail Institucional Microsoft do CPS podem gerenciar grupos.',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockGrupoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('seCandidatar (Fluxo de Candidatura e E-mail)', () => {
    it('deve gerar a candidatura e disparar o e-mail de notificação para o líder do grupo', async () => {
      const mockUsuarioLider = { usuIntId: 1, usuStrEmail: 'lider@fatec.sp.gov.br' };
      const mockGrupo = { gruIntId: 10, gruStrNome: 'Alpha Team', gruStrLider: 'Deyse', usuario: mockUsuarioLider };
      const mockDemanda = { demIntId: 5, demStrNome: 'Sistema Osiris Web', demBoolAtivo: true, demBoolAceitacao: true };
      
      // Forçando as buscas internas da service
      jest.spyOn(service, 'findByUsuarioId').mockResolvedValue(mockGrupo as any);
      mockDemandaRepository.findOne.mockResolvedValue(mockDemanda);
      mockCandidaturaRepository.findOne.mockResolvedValue(null); // Nenhuma candidatura repetida
      mockCandidaturaRepository.create.mockReturnValue({});
      mockCandidaturaRepository.save.mockResolvedValue({ canIntId: 100 });

      await service.seCandidatar(5, 1);

      // Garante que o e-mail foi disparado para a pessoa certa com os dados do projeto
      expect(mockMailService.sendStatusCandidaturaEmail).toHaveBeenCalledWith(
        'lider@fatec.sp.gov.br',
        'Sistema Osiris Web',
        'Pendente (Aguardando avaliação do Coordenador)',
      );
    });
  });
});