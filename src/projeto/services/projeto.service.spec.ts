import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProjetoService } from './projeto.service';
import { Projeto } from '../entities/projeto.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { CreateProjetoDto } from '../dto/create-projeto.dto';
import { StatusCandidatura } from '../../candidatura/dto/status.enum';

describe('ProjetoService', () => {
  let service: ProjetoService;
  let projetoRepository: Repository<Projeto>;
  let candidaturaRepository: Repository<Candidatura>;

  const mockProjetoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCandidaturaRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjetoService,
        { provide: getRepositoryToken(Projeto), useValue: mockProjetoRepository },
        { provide: getRepositoryToken(Candidatura), useValue: mockCandidaturaRepository },
      ],
    }).compile();

    service = module.get<ProjetoService>(ProjetoService);
    projetoRepository = module.get<Repository<Projeto>>(getRepositoryToken(Projeto));
    candidaturaRepository = module.get<Repository<Candidatura>>(getRepositoryToken(Candidatura));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateProjetoDto = {
      proStrDescricao: 'Projeto Osiris Expandido',
      proDateInicio: new Date('2026-05-20'),
      canIntId: 12,
    };

    it('deve criar um projeto com sucesso a partir de uma candidatura aceita', async () => {
      mockCandidaturaRepository.findOne.mockResolvedValue({ 
        canIntId: 12, 
        canStrStatus: StatusCandidatura.Aceita 
      });
      mockProjetoRepository.findOne.mockResolvedValue(null);
      mockProjetoRepository.create.mockReturnValue(dto);
      mockProjetoRepository.save.mockResolvedValue({ proIntId: 1, ...dto });

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(mockProjetoRepository.save).toHaveBeenCalled();
    });

    it('deve rejeitar e lançar erro 400 se o status da candidatura for Pendente', async () => {
      mockCandidaturaRepository.findOne.mockResolvedValue({ 
        canIntId: 12, 
        canStrStatus: StatusCandidatura.Pendente 
      });

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(
          `Não é possível iniciar um projeto. A candidatura encontra-se em estado: ${StatusCandidatura.Pendente}. Ela precisa ser "Aceita" primeiro.`,
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockProjetoRepository.save).not.toHaveBeenCalled();
    });

    it('deve rejeitar com erro 409 se a candidatura já estiver vinculada a outro projeto ativo', async () => {
      mockCandidaturaRepository.findOne.mockResolvedValue({ 
        canIntId: 12, 
        canStrStatus: StatusCandidatura.Aceita 
      });
      mockProjetoRepository.findOne.mockResolvedValue({ proIntId: 99 });

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(
          'Operação bloqueada: Já existe um projeto ativo em andamento para esta candidatura.',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });
});