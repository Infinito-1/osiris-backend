import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projeto } from '../entities/projeto.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { HistoricoProjeto } from '../../historico_projeto/entities/historico_projeto.entity';
import { CreateProjetoDto } from '../dto/create-projeto.dto';
import { UpdateProjetoDto } from '../dto/update-projeto.dto';
import { Grupo } from '../../grupo/entities/grupo.entity';

@Injectable()
export class ProjetoService {
  constructor(
    @InjectRepository(Projeto)
    private readonly projetoRepository: Repository<Projeto>,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
    @InjectRepository(HistoricoProjeto)
    private readonly historicoRepository: Repository<HistoricoProjeto>,
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
  ) {}

  private readonly relations = [
    'candidatura',
    'candidatura.grupo',
    'candidatura.grupo.usuario',
    'candidatura.demanda',
    'historicos',
    'grupo',
    'grupo.usuario',
  ];

  async findAll(): Promise<Projeto[]> {
    return this.projetoRepository.find({
      where: { proBoolAtivo: true },
      relations: this.relations,
      order: { proDateInicio: 'DESC' },
    });
  }

  async findAllStatus(): Promise<Projeto[]> {
    return this.projetoRepository.find({
      relations: this.relations,
      order: { proDateInicio: 'DESC' },
    });
  }

  // busca projetos por usuário do grupo (para o dashboard do grupo)
  async findByUsuarioId(usuarioId: number): Promise<Projeto[]> {
    const [viaCandidatura, viaGrupo] = await Promise.all([
      this.projetoRepository.find({
        where: { candidatura: { grupo: { usuario: { usuIntId: usuarioId } } } },
        relations: this.relations,
        order: { proDateInicio: 'DESC' },
      }),
      this.projetoRepository.find({
        where: { grupo: { usuario: { usuIntId: usuarioId } } },
        relations: this.relations,
        order: { proDateInicio: 'DESC' },
      }),
    ]);

    // Mescla sem duplicatas (um projeto com candidatura E grupo preenchido apareceria nos dois)
    const vistos = new Set(viaCandidatura.map((p) => p.proIntId));
    const extras = viaGrupo.filter((p) => !vistos.has(p.proIntId));

    return [...viaCandidatura, ...extras].sort(
      (a, b) =>
        new Date(b.proDateInicio).getTime() -
        new Date(a.proDateInicio).getTime(),
    );
  }

  async findById(id: number): Promise<Projeto> {
    const projeto = await this.projetoRepository.findOne({
      where: { proIntId: id },
      relations: this.relations,
    });
    if (!projeto) {
      throw new HttpException(
        'Projeto acadêmico não encontrado no Osiris',
        HttpStatus.NOT_FOUND,
      );
    }
    return projeto;
  }

  async create(dto: CreateProjetoDto): Promise<Projeto> {
    let candidatura: Candidatura | null = null;
    let grupo: Grupo | null = null;

    if (dto.canIntId) {
      candidatura = await this.candidaturaRepository.findOne({
        where: { canIntId: dto.canIntId },
        relations: ['grupo'],
      });
      if (!candidatura) {
        throw new HttpException(
          'Candidatura base não encontrada no ecossistema',
          HttpStatus.NOT_FOUND,
        );
      }
      const projetoExistente = await this.projetoRepository.findOne({
        where: { candidatura: { canIntId: dto.canIntId }, proBoolAtivo: true },
      });
      if (projetoExistente) {
        throw new HttpException(
          'Já existe um projeto ativo para esta candidatura.',
          HttpStatus.CONFLICT,
        );
      }
      // Herda o grupo da candidatura automaticamente
      grupo = candidatura.grupo ?? null;
    } else if (dto.gruIntId) {
      // Projeto sem candidatura — grupo informado diretamente
      grupo = await this.grupoRepository.findOne({
        where: { gruIntId: dto.gruIntId },
      });
      if (!grupo) {
        throw new HttpException('Grupo não encontrado', HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException(
        'Informe canIntId (candidatura) ou gruIntId (grupo) para criar um projeto.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const projeto = this.projetoRepository.create({
      proStrDescricao: dto.proStrDescricao,
      proDateInicio: dto.proDateInicio,
      proBoolAtivo: true,
      proBoolDesativadoCoordenador: false,
      candidatura: candidatura ?? undefined,
      grupo: grupo ?? undefined,
    });

    return this.projetoRepository.save(projeto);
  }

  async update(id: number, dto: UpdateProjetoDto): Promise<Projeto> {
    const projeto = await this.findById(id);

    if (dto.proStrDescricao) projeto.proStrDescricao = dto.proStrDescricao;
    if (dto.proDateInicio) projeto.proDateInicio = dto.proDateInicio;

    if (dto.canIntId) {
      const candidatura = await this.candidaturaRepository.findOne({
        where: { canIntId: dto.canIntId },
        relations: ['grupo'],
      });
      if (!candidatura) {
        throw new HttpException(
          'A nova candidatura informada não existe',
          HttpStatus.NOT_FOUND,
        );
      }
      projeto.candidatura = candidatura;
      if (candidatura.grupo) projeto.grupo = candidatura.grupo;
    }

    return this.projetoRepository.save(projeto);
  }

  // grupo desativa/ativa seu próprio projeto
  async toggleAtivo(id: number): Promise<Projeto> {
    const projeto = await this.findById(id);

    // grupo não pode reativar projeto desativado pelo coordenador
    if (!projeto.proBoolAtivo && projeto.proBoolDesativadoCoordenador) {
      throw new HttpException(
        'Este projeto foi desativado pelo coordenador. Edite o projeto para solicitar revisão.',
        HttpStatus.FORBIDDEN,
      );
    }

    projeto.proBoolAtivo = !projeto.proBoolAtivo;
    return this.projetoRepository.save(projeto);
  }

  // coordenador desativa projeto com mensagem opcional
  async desativarCoordenador(id: number, motivo?: string): Promise<Projeto> {
    const projeto = await this.findById(id);
    projeto.proBoolAtivo = false;
    projeto.proBoolDesativadoCoordenador = true;
    projeto.proStrMotivoDesativacao = motivo ?? null;
    return this.projetoRepository.save(projeto);
  }

  // coordenador reativa projeto após revisão
  async reativarCoordenador(id: number): Promise<Projeto> {
    const projeto = await this.findById(id);
    projeto.proBoolAtivo = true;
    projeto.proBoolDesativadoCoordenador = false;
    projeto.proStrMotivoDesativacao = null;
    return this.projetoRepository.save(projeto);
  }

  async delete(id: number): Promise<void> {
    const projeto = await this.findById(id);
    projeto.proBoolAtivo = false;
    await this.projetoRepository.save(projeto);
  }
}
