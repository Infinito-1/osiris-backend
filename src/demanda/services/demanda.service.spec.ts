import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandaService } from './demanda.service';
import { Demanda } from '../entities/demanda.entity';
import { TipoDemandaService } from '../../tipo_demanda/services/tipo_demanda.services';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateDemandaDto } from '../dto/create-demanda.dto';
import { UpdateDemandaDto } from '../dto/update-demanda.dto';

describe('DemandaService (Testes Unitários)', () => {
  let service: DemandaService;
  let demandaRepository: Repository<Demanda>;

  const mockDemandaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockTipoDemandaService = {
    findById: jest.fn(),
    findOrCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemandaService,
        { provide: getRepositoryToken(Demanda), useValue: mockDemandaRepository },
        { provide: TipoDemandaService, useValue: mockTipoDemandaService },
      ],
    }).compile();

    service = module.get<DemandaService>(DemandaService);
    demandaRepository = module.get<Repository<Demanda>>(getRepositoryToken(Demanda));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create (Regra de Negócio BL-13)', () => {
    it('deve criar uma nova demanda SEMPRE com demBoolAceitacao igual a false', async () => {
      const dto: CreateDemandaDto = {
        demStrNome: 'Sistema Académico Osiris',
        demStrDescricao: 'Plataforma de gestão de demandas',
        demBoolAceitaMudancaTipo: true,
        demBoolAceitacao: true, // Tentando forçar true maliciosamente
        semIntId: 1,
        empIntId: 2,
        cooIntId: 3,
      };

      const demandaGeradaPeloRepo = { ...dto, demBoolAceitacao: false };
      mockDemandaRepository.create.mockReturnValue(demandaGeradaPeloRepo);
      mockDemandaRepository.save.mockResolvedValue(demandaGeradaPeloRepo);

      const resultado = await service.create(dto);

      expect(mockDemandaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ demBoolAceitacao: false }),
      );
      expect(resultado.demBoolAceitacao).toBe(false);
    });
  });

  describe('findGaleria', () => {
    it('deve buscar apenas demandas que estejam ativas e aceitas pelo coordenador', async () => {
      mockDemandaRepository.find.mockResolvedValue([{ demIntId: 1, demBoolAtivo: true, demBoolAceitacao: true }]);

      const galeria = await service.findGaleria();

      expect(galeria.length).toBe(1);
      expect(mockDemandaRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { demBoolAtivo: true, demBoolAceitacao: true },
        }),
      );
    });
  });

  describe('findById / findOneInternal', () => {
    it('deve retornar a demanda com todas as relações se encontrada no banco', async () => {
      const mockDemanda = { demIntId: 5, demStrNome: 'Demanda Encontrada' };
      mockDemandaRepository.findOne.mockResolvedValue(mockDemanda);

      const resultado = await service.findById(5);

      expect(resultado).toEqual(mockDemanda);
      expect(mockDemandaRepository.findOne).toHaveBeenCalledWith({
        where: { demIntId: 5 },
        relations: ['semestre', 'empreendedor', 'empreendedor.usuario', 'coordenador', 'tipo'],
      });
    });

    it('deve lançar erro 404 (NOT_FOUND) se a demanda não existir', async () => {
      mockDemandaRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        new HttpException('Demanda não encontrada no sistema', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update (Regras de Segurança)', () => {
    it('deve atualizar os dados básicos da demanda e persistir as mudanças com sucesso', async () => {
      const demandaExistente = { demIntId: 1, demStrNome: 'Nome Velho', demBoolAceitacao: false };
      const dtoUpdate: UpdateDemandaDto = { demStrNome: 'Nome Atualizado' };

      mockDemandaRepository.findOne.mockResolvedValue(demandaExistente);
      mockDemandaRepository.save.mockImplementation((d) => Promise.resolve(d));

      const resultado = await service.update(1, dtoUpdate);

      expect(resultado.demStrNome).toBe('Nome Atualizado');
      expect(mockDemandaRepository.save).toHaveBeenCalledTimes(1);
    });

    it('deve permitir que o update altere o status de aceitação caso enviado no DTO de moderação', async () => {
      const demandaExistente = { demIntId: 1, demStrNome: 'Projeto Triagem', demBoolAceitacao: false };
      const dtoUpdate: UpdateDemandaDto = { demBoolAceitacao: true };

      mockDemandaRepository.findOne.mockResolvedValue(demandaExistente);
      mockDemandaRepository.save.mockImplementation((d) => Promise.resolve(d));

      const resultado = await service.update(1, dtoUpdate);

      expect(resultado.demBoolAceitacao).toBe(true);
    });
  });

  describe('desativar e remover', () => {
    it('deve marcar demBoolAtivo como false ao invés de deletar fisicamente na desativação', async () => {
      const demandaExistente = { demIntId: 1, demBoolAtivo: true };
      mockDemandaRepository.findOne.mockResolvedValue(demandaExistente);
      mockDemandaRepository.save.mockImplementation((d) => Promise.resolve(d));

      const resultado = await service.desativar(1);

      expect(resultado.demBoolAtivo).toBe(false);
    });

    it('deve executar o delete físico completo se acionado por um administrador', async () => {
      const demandaExistente = { demIntId: 1 };
      mockDemandaRepository.findOne.mockResolvedValue(demandaExistente);
      mockDemandaRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockDemandaRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});