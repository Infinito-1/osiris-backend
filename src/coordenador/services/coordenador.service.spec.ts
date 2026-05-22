import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoordenadorService } from './coordenador.service';
import { Coordenador } from '../entities/coordenador.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { MailService } from '../../mail/mail.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('CoordenadorService', () => {
  let service: CoordenadorService;
  let demandaRepository: Repository<Demanda>;
  let candidaturaRepository: Repository<Candidatura>;
  let mailService: MailService;

  // Mocks dos Repositórios do TypeORM
  const mockCoordenadorRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockDemandaRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockCandidaturaRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  // Mock do MailService integrado
  const mockMailService = {
    sendDemandaAprovadaEmail: jest.fn().mockResolvedValue(undefined),
    sendStatusCandidaturaEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordenadorService,
        { provide: getRepositoryToken(Coordenador), useValue: mockCoordenadorRepository },
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepository },
        { provide: getRepositoryToken(Demanda), useValue: mockDemandaRepository },
        { provide: getRepositoryToken(Candidatura), useValue: mockCandidaturaRepository },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<CoordenadorService>(CoordenadorService);
    demandaRepository = module.get<Repository<Demanda>>(getRepositoryToken(Demanda));
    candidaturaRepository = module.get<Repository<Candidatura>>(getRepositoryToken(Candidatura));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('aprovarDemanda', () => {
    it('deve aprovar uma demanda classificada com sucesso e disparar e-mail (RN-02 e RN-15)', async () => {
      const mockDemandaClassificada = {
        demIntId: 1,
        demStrNome: 'Sistema de Agendamentos',
        demStrSemestreRecomendado: '2026/1',
        demStrAreaTecnica: 'Engenharia de Software',
        demBoolAceitacao: false,
        demBoolAtivo: false,
        empreendedor: {
          usuario: { usuStrEmail: 'empreendedor@teste.com' },
        },
      };

      mockDemandaRepository.findOne.mockResolvedValue(mockDemandaClassificada);
      mockDemandaRepository.save.mockImplementation((d) => Promise.resolve({ ...d, demBoolAceitacao: true, demBoolAtivo: true }));

      const resultado = await service.aprovarDemanda(1);

      expect(resultado.demBoolAceitacao).toBe(true);
      expect(resultado.demBoolAtivo).toBe(true);
      expect(mockDemandaRepository.save).toHaveBeenCalled();
      expect(mailService.sendDemandaAprovadaEmail).toHaveBeenCalledWith(
        'empreendedor@teste.com',
        'Sistema de Agendamentos',
      );
    });

    it('deve barrar a aprovação se a demanda não possuir classificação (RN-02 / RN-03)', async () => {
      const mockDemandaSemClassificacao = {
        demIntId: 2,
        demStrNome: 'App de Entregas',
        demStrSemestreRecomendado: null,
        demStrAreaTecnica: null,
      };

      mockDemandaRepository.findOne.mockResolvedValue(mockDemandaSemClassificacao);

      await expect(service.aprovarDemanda(2)).rejects.toThrow(
        new HttpException(
          'Aprovação bloqueada: A demanda precisa ser previamente Classificada (Semestre Recomendado e Área Técnica preenchidos)',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockDemandaRepository.save).not.toHaveBeenCalled();
      expect(mailService.sendDemandaAprovadaEmail).not.toHaveBeenCalled();
    });
  });

  describe('gerenciarCandidaturas', () => {
    it('deve atualizar o status para Aceita, atualizar a demanda e notificar o líder do grupo (RN-06 e RN-15)', async () => {
      const dto = { candidaturaId: 10, status: 'Aceita' as any };
      const mockCandidatura = {
        canIntId: 10,
        canStrStatus: 'Pendente',
        demanda: { demIntId: 5, demStrNome: 'E-commerce Osiris', demBoolAceitacao: false },
        grupo: {
          usuario: { usuStrEmail: 'lider.grupo@instituicao.com' },
        },
      };

      mockCandidaturaRepository.findOne.mockResolvedValue(mockCandidatura);
      mockCandidaturaRepository.save.mockImplementation((c) => Promise.resolve({ ...c, canStrStatus: dto.status, canBoolAprovacao: true }));

      const resultado = await service.gerenciarCandidaturas(dto);

      expect(resultado.canStrStatus).toBe('Aceita');
      expect(resultado.canBoolAprovacao).toBe(true);
      expect(mockDemandaRepository.save).toHaveBeenCalled(); 
      expect(mailService.sendStatusCandidaturaEmail).toHaveBeenCalledWith(
        'lider.grupo@instituicao.com',
        'E-commerce Osiris',
        'Aceita',
      );
    });

    it('deve lançar erro 404 caso a candidatura selecionada não exista', async () => {
      mockCandidaturaRepository.findOne.mockResolvedValue(null);

      await expect(service.gerenciarCandidaturas({ candidaturaId: 99, status: 'Recusada' as any }))
        .rejects.toThrow(new HttpException('Candidatura selecionada não encontrada', HttpStatus.NOT_FOUND));
    });
  });

  describe('getDashboardDados', () => {
    it('deve retornar as métricas gerenciais do painel com sucesso resolvendo os counts consecutivos', async () => {
      mockCoordenadorRepository.findOne.mockResolvedValue({ cooStrCurso: 'Análise e Desenvolvimento de Sistemas' });
      
      mockDemandaRepository.count
        .mockResolvedValueOnce(3) 
        .mockResolvedValueOnce(8); 
        
      mockCandidaturaRepository.count.mockResolvedValue(15);

      const dashboard = await service.getDashboardDados(1);

      expect(dashboard).toHaveProperty('modulo');
      expect(dashboard.coordenador).toBe('Análise e Desenvolvimento de Sistemas');
      expect(dashboard.metricas.demandasPendentesDeAprovacao).toBe(3);
      expect(dashboard.metricas.demandasPublicadasGaleria).toBe(8);
      expect(dashboard.metricas.totalDeCandidaturasSubmetidas).toBe(15);
    });
  });
});