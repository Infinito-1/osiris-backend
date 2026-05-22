import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CandidaturaService } from './candidatura.service';
import { Candidatura } from '../entities/candidatura.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Coordenador } from '../../coordenador/entities/coordenador.entity';
import { StatusCandidatura } from '../dto/status.enum';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('CandidaturaService', () => {
  let service: CandidaturaService;
  let candidaturaRepository: Repository<Candidatura>;
  let grupoRepository: Repository<Grupo>;
  let demandaRepository: Repository<Demanda>;

  // Mocks dos Repositórios do TypeORM
  const mockCandidaturaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGrupoRepository = {
    findOne: jest.fn(),
  };

  const mockDemandaRepository = {
    findOne: jest.fn(),
  };

  const mockCoordenadorRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidaturaService,
        { provide: getRepositoryToken(Candidatura), useValue: mockCandidaturaRepository },
        { provide: getRepositoryToken(Grupo), useValue: mockGrupoRepository },
        { provide: getRepositoryToken(Demanda), useValue: mockDemandaRepository },
        { provide: getRepositoryToken(Coordenador), useValue: mockCoordenadorRepository },
      ],
    }).compile();

    service = module.get<CandidaturaService>(CandidaturaService);
    candidaturaRepository = module.get<Repository<Candidatura>>(getRepositoryToken(Candidatura));
    grupoRepository = module.get<Repository<Grupo>>(getRepositoryToken(Grupo));
    demandaRepository = module.get<Repository<Demanda>>(getRepositoryToken(Demanda));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('deve retornar uma candidatura com sucesso', async () => {
      const mockCandidatura = { canIntId: 1, canStrStatus: StatusCandidatura.Pendente };
      mockCandidaturaRepository.findOne.mockResolvedValue(mockCandidatura);

      const resultado = await service.findById(1);
      expect(resultado).toEqual(mockCandidatura);
    });

    it('deve lancar HttpException (404) se a candidatura nao existir', async () => {
      mockCandidaturaRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(HttpException);
    });

    it('deve barrar a visualizacao se um Grupo tentar acessar a candidatura de outro grupo (RN-10)', async () => {
      const mockCandidatura = { 
        canIntId: 1, 
        grupo: { gruIntId: 10 } 
      };
      mockCandidaturaRepository.findOne.mockResolvedValue(mockCandidatura);
      
      // Simula que o usuário logado pertence ao grupo ID 99
      mockGrupoRepository.findOne.mockResolvedValue({ gruIntId: 99 });

      await expect(
        service.findById(1, { id: 2, role: 'Grupo' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('create', () => {
    it('deve criar uma candidatura com status Pendente com sucesso', async () => {
      const dto = { demIntId: 1, gruIntId: 2, canStrStatus: StatusCandidatura.Pendente, canBoolAprovacao: false };
      
      mockGrupoRepository.findOne.mockResolvedValue({ gruIntId: 2 });
      mockDemandaRepository.findOne.mockResolvedValue({ demIntId: 1 });
      mockCandidaturaRepository.findOne.mockResolvedValue(null); // Nenhuma candidatura existente
      
      const mockCandidaturaCriada = { canIntId: 1, canStrStatus: StatusCandidatura.Pendente };
      mockCandidaturaRepository.create.mockReturnValue(mockCandidaturaCriada);
      mockCandidaturaRepository.save.mockResolvedValue(mockCandidaturaCriada);

      const resultado = await service.create(dto);
      expect(resultado.canStrStatus).toBe(StatusCandidatura.Pendente);
      expect(candidaturaRepository.save).toHaveBeenCalled();
    });

    it('deve barrar a criacao se o grupo ja possuir candidatura ativa para a mesma demanda', async () => {
      const dto = { demIntId: 1, gruIntId: 2, canStrStatus: StatusCandidatura.Pendente, canBoolAprovacao: false };
      
      mockGrupoRepository.findOne.mockResolvedValue({ gruIntId: 2 });
      mockDemandaRepository.findOne.mockResolvedValue({ demIntId: 1 });
      
      // Simula que já existe uma candidatura pendente para essa mesma combinação
      mockCandidaturaRepository.findOne.mockResolvedValue({ canIntId: 5, canStrStatus: StatusCandidatura.Pendente });

      await expect(service.create(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('desistir', () => {
    it('deve alterar o status da candidatura para Desistente (RN-14 / RF-19)', async () => {
      mockGrupoRepository.findOne.mockResolvedValue({ gruIntId: 2 }); // Grupo dono do usuário logado
      
      const mockCandidaturaAtiva = { 
        canIntId: 1, 
        canStrStatus: StatusCandidatura.Pendente, 
        grupo: { gruIntId: 2 } 
      };
      mockCandidaturaRepository.findOne.mockResolvedValue(mockCandidaturaAtiva);
      mockCandidaturaRepository.save.mockImplementation((c) => Promise.resolve(c));

      const resultado = await service.desistir(1, 100); // id da cand, id do usu logado
      
      expect(resultado.canStrStatus).toBe(StatusCandidatura.Desistente);
      expect(resultado.canBoolAprovacao).toBe(false);
    });

    it('deve barrar a desistencia se o grupo logado nao for o dono da candidatura', async () => {
      mockGrupoRepository.findOne.mockResolvedValue({ gruIntId: 2 }); // Grupo logado é o 2
      
      const mockCandidaturaDeOutro = { 
        canIntId: 1, 
        canStrStatus: StatusCandidatura.Pendente, 
        grupo: { gruIntId: 99 } // A candidatura pertence ao grupo 99
      };
      mockCandidaturaRepository.findOne.mockResolvedValue(mockCandidaturaDeOutro);

      await expect(service.desistir(1, 100)).rejects.toThrow(UnauthorizedException);
    });
  });
});