import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { HistoricoProjetoService } from './historico_projeto.service';
import { HistoricoProjeto } from '../entities/historico_projeto.entity';
import { Projeto } from '../../projeto/entities/projeto.entity';
import { CreateHistoricoProjetoDto } from '../dto/create-historico-projeto.dto';
import { StatusProjeto } from '../dto/status-projeto.enum';

describe('HistoricoProjetoService', () => {
  let service: HistoricoProjetoService;
  let historicoRepository: Repository<HistoricoProjeto>;
  let projetoRepository: Repository<Projeto>;

  const mockHistoricoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockProjetoRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoricoProjetoService,
        { provide: getRepositoryToken(HistoricoProjeto), useValue: mockHistoricoRepository },
        { provide: getRepositoryToken(Projeto), useValue: mockProjetoRepository },
      ],
    }).compile();

    service = module.get<HistoricoProjetoService>(HistoricoProjetoService);
    historicoRepository = module.get<Repository<HistoricoProjeto>>(getRepositoryToken(HistoricoProjeto));
    projetoRepository = module.get<Repository<Projeto>>(getRepositoryToken(Projeto));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateHistoricoProjetoDto = {
      hspStrDesc: 'Configuração Inicial do Repositório do Osiris',
      hspStrLinkProjeto: 'https://github.com/osiris/backend',
      hspStrStatus: StatusProjeto.Planejamento,
      proIntId: 1,
    };

    it('deve anexar uma evolução ao histórico se o projeto associado existir', async () => {
      mockProjetoRepository.findOne.mockResolvedValue({ proIntId: 1, proBoolAtivo: true });
      mockHistoricoRepository.create.mockReturnValue(dto);
      mockHistoricoRepository.save.mockResolvedValue({ hspIntId: 10, ...dto });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockProjetoRepository.findOne).toHaveBeenCalledWith({ where: { proIntId: dto.proIntId, proBoolAtivo: true } });
      expect(mockHistoricoRepository.save).toHaveBeenCalled();
    });

    it('deve lançar erro 404 se tentar criar histórico para um projeto inexistente', async () => {
      mockProjetoRepository.findOne.mockResolvedValue(null); // Projeto não encontrado

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(
          'Não é possível criar o histórico. Projeto associado não encontrado ou está inativo.',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(mockHistoricoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByhspStrDesc', () => {
    it('deve buscar históricos por aproximação de texto com sucesso', async () => {
      mockHistoricoRepository.find.mockResolvedValue([{ hspIntId: 1, hspStrDesc: 'Sprint 1 concluída' }]);

      const result = await service.findByhspStrDesc('Sprint');
      expect(result).toHaveLength(1);
      expect(mockHistoricoRepository.find).toHaveBeenCalled();
    });
  });
});