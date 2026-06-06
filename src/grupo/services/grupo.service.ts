import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Grupo } from '../entities/grupo.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { UpdateGrupoDto } from '../dto/update-grupo.dto';
import { StatusCandidatura } from '../../candidatura/dto/status.enum';
import { MailService } from '../../mail/mail.service';
import { Semestre } from '../../semestre/entities/semestre.entity';
import { Projeto } from '../../projeto/entities/projeto.entity';
import { HistoricoProjeto } from '../../historico_projeto/entities/historico_projeto.entity';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
    @InjectRepository(Semestre)
    private readonly semestreRepository: Repository<Semestre>,
    @InjectRepository(Projeto)
    private readonly projetoRepository: Repository<Projeto>,
    @InjectRepository(HistoricoProjeto)
    private readonly historicoRepository: Repository<HistoricoProjeto>,
    private readonly mailService: MailService, // 👈 Injetado com sucesso no construtor
  ) {}

  async findAll(): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { gruBoolAtivo: true },
      relations: ['usuario', 'semestre'],
    });
  }

  async findById(id: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({
      where: { gruIntId: id },
      relations: ['usuario', 'semestre'],
    });
    if (!grupo) {
      throw new HttpException(
        'Grupo acadêmico não encontrado no Osiris',
        HttpStatus.NOT_FOUND,
      );
    }
    return grupo;
  }

  async findByUsuarioId(usuarioId: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({
      where: { usuario: { usuIntId: usuarioId }, gruBoolAtivo: true },
      relations: ['usuario', 'semestre'],
    });
    if (!grupo) {
      throw new HttpException(
        'Perfil de grupo não encontrado para este usuário.',
        HttpStatus.NOT_FOUND,
      );
    }
    return grupo;
  }

  async findByName(name: string): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { gruStrNome: ILike(`%${name}%`), gruBoolAtivo: true },
      relations: ['usuario', 'semestre'],
    });
  }

  async create(dto: CreateGrupoDto): Promise<Grupo> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: dto.usuIntId },
    });
    if (!usuario) {
      throw new HttpException(
        'Usuário de credencial base não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    const semestre = await this.semestreRepository.findOne({
      where: { semIntId: dto.semIntId },
    });

    // Mantendo a validação robusta alinhada ao Regex que você já utiliza no UsuarioService
    const emailInstitucionalRegex =
      /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;

    if (
      usuario.usuStrEmail &&
      !emailInstitucionalRegex.test(usuario.usuStrEmail)
    ) {
      throw new HttpException(
        'Apenas contas vinculadas ao E-mail Institucional Microsoft do CPS podem gerenciar grupos.',
        HttpStatus.BAD_REQUEST,
      );
    }

    usuario.usuStrTipo = 'Grupo';

    await this.usuarioRepository.save(usuario);

    const grupo = this.grupoRepository.create({
      gruStrNome: dto.gruStrNome,
      gruStrDescricao: dto.gruStrDescricao,
      gruStrLider: usuario.usuStrNome,
      gruChaRa: dto.gruChaRa,
      gruIntTamanho: dto.gruIntTamanho,
      gruStrMembros: dto.gruStrMembros,
      gruBoolAtivo: true,
      usuario: usuario,
      semestre: semestre ?? undefined,
    });

    return this.grupoRepository.save(grupo);
  }

  async update(id: number, dto: UpdateGrupoDto): Promise<Grupo> {
    const grupo = await this.findById(id);

    if (dto.gruStrNome) grupo.gruStrNome = dto.gruStrNome;
    if (dto.gruStrDescricao) grupo.gruStrDescricao = dto.gruStrDescricao;
    if (dto.gruChaRa) grupo.gruChaRa = dto.gruChaRa;
    if (dto.gruIntTamanho) grupo.gruIntTamanho = dto.gruIntTamanho;
    if (dto.gruStrMembros) grupo.gruStrMembros = dto.gruStrMembros;
    if (dto.gruStrPortfolio) grupo.gruStrPortfolio = dto.gruStrPortfolio;

    if (dto.usuIntId) {
      const novoUsuario = await this.usuarioRepository.findOne({
        where: { usuIntId: dto.usuIntId },
      });
      if (!novoUsuario) {
        throw new HttpException(
          'Novo usuário de associação não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      grupo.usuario = novoUsuario;
    }

    return this.grupoRepository.save(grupo);
  }

  async suspender(id: number): Promise<Grupo> {
    const grupo = await this.findById(id);
    if (grupo.usuario) {
      grupo.usuario.usuBoolAtivo = false;
      await this.usuarioRepository.save(grupo.usuario);
    }
    grupo.gruBoolAtivo = false;
    return this.grupoRepository.save(grupo);
  }

  async delete(id: number): Promise<void> {
    const grupo = await this.findById(id);
    await this.grupoRepository.remove(grupo);
  }

  async seCandidatar(
    demIntId: number,
    usuarioId: number,
  ): Promise<Candidatura> {
    const grupo = await this.findByUsuarioId(usuarioId);

    const demanda = await this.demandaRepository.findOne({
      where: { demIntId, demBoolAtivo: true, demBoolAceitacao: true },
      relations: ['coordenador'],
    });

    if (!demanda) {
      throw new HttpException(
        'Demanda não está disponível para candidaturas',
        HttpStatus.NOT_FOUND,
      );
    }

    const candidaturaExistente = await this.candidaturaRepository.findOne({
      where: { grupo: { gruIntId: grupo.gruIntId }, demanda: { demIntId } },
    });

    if (candidaturaExistente) {
      throw new HttpException(
        'Esse grupo já possui uma candidatura ativa para esta demanda',
        HttpStatus.BAD_REQUEST,
      );
    }

    const novaCandidatura = this.candidaturaRepository.create({
      grupo: grupo,
      demanda: demanda,
      coordenador: demanda.coordenador,
      canStrStatus: StatusCandidatura.Pendente,
    });

    const candidaturaSalva =
      await this.candidaturaRepository.save(novaCandidatura);

    // 📧 GATILHO DE E-MAIL INTEGRADO: Usa o método que você já criou no MailService!
    if (grupo.usuario && grupo.usuario.usuStrEmail) {
      await this.mailService.sendStatusCandidaturaEmail(
        grupo.usuario.usuStrEmail,
        demanda.demStrNome,
        'Pendente (Aguardando avaliação do Coordenador)',
      );
    }

    return candidaturaSalva;
  }

  async desistirCandidatura(
    canIntId: number,
    usuarioId: number,
  ): Promise<void> {
    const grupo = await this.findByUsuarioId(usuarioId);

    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId, grupo: { gruIntId: grupo.gruIntId } },
    });

    if (!candidatura) {
      throw new HttpException(
        'Candidatura não encontrada ou não pertence a este grupo',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.candidaturaRepository.remove(candidatura);
  }

  async getDashboardDados(usuarioId: number): Promise<any> {
    const grupo = await this.findByUsuarioId(usuarioId);

    const candidaturas = await this.candidaturaRepository.find({
      where: { grupo: { gruIntId: grupo.gruIntId } },
      relations: ['demanda'],
      order: { canIntId: 'DESC' },
    });

    // Projetos pelos dois caminhos
    const [projetosViaCandidatura, projetosViaGrupo] = await Promise.all([
      this.projetoRepository.find({
        where: { candidatura: { grupo: { gruIntId: grupo.gruIntId } } },
        relations: [
          'candidatura',
          'candidatura.grupo',
          'candidatura.demanda',
          'historicos',
          'grupo',
        ],
        order: { proDateInicio: 'DESC' },
      }),
      this.projetoRepository.find({
        where: { grupo: { gruIntId: grupo.gruIntId } },
        relations: [
          'candidatura',
          'candidatura.grupo',
          'candidatura.demanda',
          'historicos',
          'grupo',
        ],
        order: { proDateInicio: 'DESC' },
      }),
    ]);

    const vistos = new Set(projetosViaCandidatura.map((p) => p.proIntId));
    const extras = projetosViaGrupo.filter((p) => !vistos.has(p.proIntId));
    const projetos = [...projetosViaCandidatura, ...extras].sort(
      (a, b) =>
        new Date(b.proDateInicio).getTime() -
        new Date(a.proDateInicio).getTime(),
    );

    // Grupos vinculados ao usuário-representante (base para iteração futura)
    const gruposVinculados = await this.grupoRepository.find({
      where: { usuario: { usuIntId: usuarioId } },
      relations: ['semestre'],
    });

    const candidaturasFormatadas = candidaturas.map((c) => ({
      id: c.canIntId,
      demanda: c.demanda?.demStrNome ?? '—',
      status: c.canStrStatus,
      aprovacao: c.canBoolAprovacao,
    }));

    const projetosFormatados = projetos.map((projeto) => {
      const historicosOrdenados = [...(projeto.historicos ?? [])].sort(
        (a, b) =>
          new Date(a.hspDateData).getTime() - new Date(b.hspDateData).getTime(),
      );

      return {
        id: projeto.proIntId,
        descricao: projeto.proStrDescricao,
        dataInicio: projeto.proDateInicio,
        ativo: projeto.proBoolAtivo,
        desativadoCoordenador: projeto.proBoolDesativadoCoordenador,
        motivoDesativacao: projeto.proStrMotivoDesativacao ?? null,
        candidatura: projeto.candidatura
          ? {
              id: projeto.candidatura.canIntId,
              status: projeto.candidatura.canStrStatus,
              grupo: projeto.candidatura.grupo
                ? {
                    nome: projeto.candidatura.grupo.gruStrNome,
                    lider: projeto.candidatura.grupo.gruStrLider,
                  }
                : null,
              demanda: projeto.candidatura.demanda
                ? {
                    id: projeto.candidatura.demanda.demIntId,
                    nome: projeto.candidatura.demanda.demStrNome,
                    descricao: projeto.candidatura.demanda.demStrDescricao,
                  }
                : null,
            }
          : null,
        historicos: historicosOrdenados.map((h) => ({
          id: h.hspIntId,
          descricao: h.hspStrDesc,
          status: h.hspStrStatus,
          data: h.hspDateData,
          link: h.hspStrLinkProjeto ?? null,
          linkGithub: h.hspStrLinkGithub ?? null,
          linkDeploy: h.hspStrLinkDeploy ?? null,
        })),
      };
    });

    const gruposVinculadosFormatados = gruposVinculados.map((g) => ({
      id: g.gruIntId,
      nome: g.gruStrNome,
      semestre: g.semestre?.semStrDescricao ?? null,
      ativo: g.gruBoolAtivo,
    }));

    return {
      grupo: grupo.gruStrNome,
      lider: grupo.gruStrLider,
      ra: grupo.gruChaRa,
      semestre: grupo.semestre?.semStrDescricao ?? null,
      membros: grupo.gruStrMembros ?? null,
      tamanho: grupo.gruIntTamanho,
      metricas: {
        totalCandidaturasEnviadas: candidaturas.length,
        candidaturasAceitas: candidaturas.filter(
          (c) => c.canStrStatus === StatusCandidatura.Aceita,
        ).length,
      },
      candidaturas: candidaturasFormatadas,
      projetos: projetosFormatados,
      gruposVinculados: gruposVinculadosFormatados,
    };
  }

  // Busca o grupo ativo do usuário (usado nas ações de candidatura/projeto)
  async findGrupoAtivoByUsuarioId(usuarioId: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({
      where: { usuario: { usuIntId: usuarioId }, gruBoolAtivo: true },
      relations: ['usuario', 'semestre'],
    });
    if (!grupo) {
      throw new HttpException(
        'Nenhum grupo ativo encontrado para este usuário.',
        HttpStatus.NOT_FOUND,
      );
    }
    return grupo;
  }

  // Lista todos os grupos do usuário (ativos e inativos)
  async findTodosByUsuarioId(usuarioId: number): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { usuario: { usuIntId: usuarioId } },
      relations: ['semestre'],
      order: { gruBoolAtivo: 'DESC', gruIntId: 'DESC' },
    });
  }

  // Cria novo grupo para usuário já existente, desativando o anterior
  async criarNovoGrupo(dto: CreateGrupoDto, usuarioId: number): Promise<Grupo> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: usuarioId },
    });
    if (!usuario) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    // Desativa todos os grupos ativos do usuário
    const gruposAtivos = await this.grupoRepository.find({
      where: { usuario: { usuIntId: usuarioId }, gruBoolAtivo: true },
    });
    for (const g of gruposAtivos) {
      g.gruBoolAtivo = false;
      await this.grupoRepository.save(g);
    }

    const semestre = await this.semestreRepository.findOne({
      where: { semIntId: dto.semIntId },
    });

    const novoGrupo = this.grupoRepository.create({
      gruStrNome: dto.gruStrNome,
      gruStrDescricao: dto.gruStrDescricao,
      gruStrLider: usuario.usuStrNome,
      gruChaRa: dto.gruChaRa,
      gruIntTamanho: dto.gruIntTamanho,
      gruStrMembros: dto.gruStrMembros,
      gruBoolAtivo: true,
      usuario: usuario,
      semestre: semestre ?? undefined,
    });

    const salvo = await this.grupoRepository.save(novoGrupo);
    return this.grupoRepository.findOne({
      where: { gruIntId: salvo.gruIntId },
      relations: ['usuario', 'semestre'],
    }) as Promise<Grupo>;
  }

  async reativarGrupo(gruIntId: number, usuarioId: number): Promise<Grupo> {
    // Desativa o grupo atualmente ativo
    const gruposAtivos = await this.grupoRepository.find({
      where: { usuario: { usuIntId: usuarioId }, gruBoolAtivo: true },
    });
    for (const g of gruposAtivos) {
      g.gruBoolAtivo = false;
      await this.grupoRepository.save(g);
    }

    // Reativa o grupo solicitado
    const grupo = await this.grupoRepository.findOne({
      where: { gruIntId, usuario: { usuIntId: usuarioId } },
      relations: ['usuario', 'semestre'],
    });
    if (!grupo) {
      throw new HttpException('Grupo não encontrado.', HttpStatus.NOT_FOUND);
    }

    grupo.gruBoolAtivo = true;
    return this.grupoRepository.save(grupo);
  }

  //   const entregasFormatadas = historicos
  //     .sort(
  //       (a, b) =>
  //         new Date(b.hspDateData).getTime() - new Date(a.hspDateData).getTime(),
  //     )
  //     .map((h) => ({
  //       id: h.hspIntId,
  //       descricao: h.hspStrDesc,
  //       link: h.hspStrLinkProjeto,
  //       status: h.hspStrStatus,
  //       data: new Date(h.hspDateData).toLocaleDateString('pt-BR'),
  //     }));

  //   return {
  //     grupo: grupo.gruStrNome,
  //     lider: grupo.gruStrLider,
  //     ra: grupo.gruChaRa,
  //     semestre: grupo.semestre?.semStrDescricao ?? null,
  //     membros: grupo.gruStrMembros ?? null,
  //     tamanho: grupo.gruIntTamanho,
  //     metricas: {
  //       totalCandidaturasEnviadas: candidaturas.length,
  //       candidaturasAceitas: candidaturas.filter(
  //         (c) => c.canStrStatus === StatusCandidatura.Aceita,
  //       ).length,
  //     },
  //     projetoAtual: projetoFormatado,
  //     candidaturas: candidaturasFormatadas,
  //     entregas: entregasFormatadas,
  //   };
  // }
}
