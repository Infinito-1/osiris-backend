import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpreendedorService } from './empreendedor.service';
import { Empreendedor } from '../entities/empreendedor.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateEmpreendedorDto } from '../dto/create-empreendedor.dto';

describe('EmpreendedorService (Testes Unitários)', () => {
  let service: EmpreendedorService;
  let empreendedorRepository: Repository<Empreendedor>;
  let usuarioRepository: Repository<Usuario>;
  let demandaRepository: Repository<Demanda>;
  let candidaturaRepository: Repository<Candidatura>;

  const mockEmpreendedorRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
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
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpreendedorService,
        { provide: getRepositoryToken(Empreendedor), useValue: mockEmpreendedorRepository },
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepository },
        { provide: getRepositoryToken(Demanda), useValue: mockDemandaRepository },
        { provide: getRepositoryToken(Candidatura), useValue: mockCandidaturaRepository },
      ],
    }).compile();

    service = module.get<EmpreendedorService>(EmpreendedorService);
    empreendedorRepository = module.get<Repository<Empreendedor>>(getRepositoryToken(Empreendedor));
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    demandaRepository = module.get<Repository<Demanda>>(getRepositoryToken(Demanda));
    candidaturaRepository = module.get<Repository<Candidatura>>(getRepositoryToken(Candidatura));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um empreendedor com sucesso e atualizar o tipo do usuario base para Empreendedor', async () => {
      const dto: CreateEmpreendedorDto = {
        empStrEmpresa: 'Fatec Inovações',
        empChaCnpj: '12345678000100',
        usuIntId: 10,
      };

      const mockUsuario = { usuIntId: 10, usuStrTipo: 'Pendente' };
      const mockEmpreendedorSalvo = { empIntId: 1, ...dto, usuario: mockUsuario };

      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuario);
      mockUsuarioRepository.save.mockResolvedValue({ ...mockUsuario, usuStrTipo: 'Empreendedor' });
      mockEmpreendedorRepository.create.mockReturnValue(mockEmpreendedorSalvo);
      mockEmpreendedorRepository.save.mockResolvedValue(mockEmpreendedorSalvo);

      const resultado = await service.create(dto);

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({ where: { usuIntId: dto.usuIntId } });
      expect(mockUsuario.usuStrTipo).toBe('Empreendedor');
      expect(usuarioRepository.save).toHaveBeenCalledWith(mockUsuario);
      expect(resultado).toEqual(mockEmpreendedorSalvo);
    });

    it('deve lançar erro 404 se o usuário de credencial base informado não existir', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);
      const dto: CreateEmpreendedorDto = { empStrEmpresa: 'Empresa X', empChaCnpj: '00000000000000', usuIntId: 99 };

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException('Usuário de credencial base não encontrado', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('reativarDemanda', () => {
    it('deve reativar a demanda colocando demBoolAtivo como true e resetando demBoolAceitacao para triagem', async () => {
      const mockEmpreendedor = { empIntId: 2, empStrEmpresa: 'Empresa Teste' };
      const mockDemanda = { demIntId: 5, demBoolAtivo: false, demBoolAceitacao: true, empreendedor: { empIntId: 2 } };

      mockEmpreendedorRepository.findOne.mockResolvedValue(mockEmpreendedor);
      mockDemandaRepository.findOne.mockResolvedValue(mockDemanda);
      mockDemandaRepository.save.mockImplementation((d) => Promise.resolve(d));

      const resultado = await service.reativarDemanda(5, 10); // demIntId: 5, usuarioId: 10

      expect(resultado.demBoolAtivo).toBe(true);
      expect(resultado.demBoolAceitacao).toBe(false); // Obrigatoriamente passa pela triagem de novo
      expect(mockDemandaRepository.save).toHaveBeenCalledWith(mockDemanda);
    });

    it('deve lançar 404 se a demanda não pertencer ao empreendedor requisitante', async () => {
      const mockEmpreendedor = { empIntId: 2 };
      mockEmpreendedorRepository.findOne.mockResolvedValue(mockEmpreendedor);
      mockDemandaRepository.findOne.mockResolvedValue(null); // Banco não encontra demanda daquele proprietário

      await expect(service.reativarDemanda(99, 10)).rejects.toThrow(
        new HttpException('Demanda inexistente ou não associada à sua conta', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getDashboardDados', () => {
    it('deve calcular e unificar as métricas corporativas perfeitamente', async () => {
      const mockEmpreendedor = { empIntId: 1, empStrEmpresa: 'Alpha Tech', empChaCnpj: '11222333000144' };
      
      mockEmpreendedorRepository.findOne.mockResolvedValue(mockEmpreendedor);
      
      // Configurando as contagens de fluxo do repositório
      mockDemandaRepository.count
        .mockResolvedValueOnce(10)  // Total submetido
        .mockResolvedValueOnce(4)   // Aprovadas na galeria pública
        .mockResolvedValueOnce(3);  // Em análise pendente na triagem ativa

      mockCandidaturaRepository.count.mockResolvedValue(5); // Propostas recebidas

      const dadosDashboard = await service.getDashboardDados(12);

      expect(dadosDashboard.empresa).toBe('Alpha Tech');
      expect(dadosDashboard.metricas.totalDemandasSubmetidas).toBe(10);
      expect(dadosDashboard.metricas.demandasPublicadasNaGaleria).toBe(4);
      expect(dadosDashboard.metricas.demandasEmAnalisePeloCoordenador).toBe(3);
      expect(dadosDashboard.metricas.propostasDeGruposRecebidas).toBe(5);
    });
  });

  describe('suspender', () => {
    it('deve desativar logicamente o login do usuário vinculado ao empreendedor', async () => {
      const mockEmpreendedor = { empIntId: 1, usuario: { usuIntId: 8, usuBoolAtivo: true } };
      mockEmpreendedorRepository.findOne.mockResolvedValue(mockEmpreendedor);
      mockUsuarioRepository.save.mockImplementation((u) => Promise.resolve(u));

      const resultado = await service.suspender(1);

      expect(resultado.usuario.usuBoolAtivo).toBe(false);
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ usuBoolAtivo: false }),
      );
    });
  });
});