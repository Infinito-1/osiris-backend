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
    
    private readonly mailService: MailService, // 👈 Injetado com sucesso no construtor
  ) {}

  async findAll(): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { gruBoolAtivo: true },
      relations: ['usuario', 'semestre']
    });
  }

  async findById(id: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({ 
      where: { gruIntId: id }, 
      relations: ['usuario', 'semestre'] 
    });
    if (!grupo) {
      throw new HttpException('Grupo acadêmico não encontrado no Osiris', HttpStatus.NOT_FOUND);
    }
    return grupo;
  }

  async findByUsuarioId(usuarioId: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({
      where: { usuario: { usuIntId: usuarioId } },
      relations: ['usuario', 'semestre'],
    });
    if (!grupo) {
      throw new HttpException('Perfil de grupo não encontrado para este usuário.', HttpStatus.NOT_FOUND);
    }
    return grupo;
  }

  async findByName(name: string): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { gruStrNome: ILike(`%${name}%`), gruBoolAtivo: true },
      relations: ['usuario', 'semestre']
    });
  }

  async create(dto: CreateGrupoDto): Promise<Grupo> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: dto.usuIntId } });
    if (!usuario) {
      throw new HttpException('Usuário de credencial base não encontrado', HttpStatus.NOT_FOUND);
    }

    // Mantendo a validação robusta alinhada ao Regex que você já utiliza no UsuarioService
    const emailInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
    
    if (usuario.usuStrEmail && !emailInstitucionalRegex.test(usuario.usuStrEmail)) {
      throw new HttpException(
        'Apenas contas vinculadas ao E-mail Institucional Microsoft do CPS podem gerenciar grupos.',
        HttpStatus.BAD_REQUEST
      );
    }

    usuario.usuStrTipo = 'Grupo';
    await this.usuarioRepository.save(usuario);

    const grupo = this.grupoRepository.create({
      gruStrNome: dto.gruStrNome,
      gruStrDescricao: dto.gruStrDescricao,
      gruStrLider: dto.gruStrLider,
      gruChaRa: dto.gruChaRa,
      gruIntTamanho: dto.gruIntTamanho,
      gruStrMembros: dto.gruStrMembros,
      gruBoolAtivo: true,
      usuario: usuario,
    });

    return this.grupoRepository.save(grupo);
  }

  async update(id: number, dto: UpdateGrupoDto): Promise<Grupo> {
    const grupo = await this.findById(id);

    if (dto.gruStrNome) grupo.gruStrNome = dto.gruStrNome;
    if (dto.gruStrDescricao) grupo.gruStrDescricao = dto.gruStrDescricao;
    if (dto.gruStrLider) grupo.gruStrLider = dto.gruStrLider;
    if (dto.gruChaRa) grupo.gruChaRa = dto.gruChaRa;
    if (dto.gruIntTamanho) grupo.gruIntTamanho = dto.gruIntTamanho;
    if (dto.gruStrMembros) grupo.gruStrMembros = dto.gruStrMembros;
    if (dto.gruStrPortfolio) grupo.gruStrPortfolio = dto.gruStrPortfolio;

    if (dto.usuIntId) {
      const novoUsuario = await this.usuarioRepository.findOne({ where: { usuIntId: dto.usuIntId } });
      if (!novoUsuario) {
        throw new HttpException('Novo usuário de associação não encontrado', HttpStatus.NOT_FOUND);
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

  async seCandidatar(demIntId: number, usuarioId: number): Promise<Candidatura> {
    const grupo = await this.findByUsuarioId(usuarioId);
    
    const demanda = await this.demandaRepository.findOne({ 
      where: { demIntId, demBoolAtivo: true, demBoolAceitacao: true },
      relations: ['coordenador']
    });

    if (!demanda) {
      throw new HttpException('Demanda não está disponível para candidaturas', HttpStatus.NOT_FOUND);
    }

    const candidaturaExistente = await this.candidaturaRepository.findOne({
      where: { grupo: { gruIntId: grupo.gruIntId }, demanda: { demIntId } }
    });

    if (candidaturaExistente) {
      throw new HttpException('Esse grupo já possui uma candidatura ativa para esta demanda', HttpStatus.BAD_REQUEST);
    }

    const novaCandidatura = this.candidaturaRepository.create({
      grupo: grupo,
      demanda: demanda,
      coordenador: demanda.coordenador,
      canStrStatus: StatusCandidatura.Pendente
    });

    const candidaturaSalva = await this.candidaturaRepository.save(novaCandidatura);

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

  async desistirCandidatura(canIntId: number, usuarioId: number): Promise<void> {
    const grupo = await this.findByUsuarioId(usuarioId);
    
    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId, grupo: { gruIntId: grupo.gruIntId } }
    });

    if (!candidatura) {
      throw new HttpException('Candidatura não encontrada ou não pertence a este grupo', HttpStatus.NOT_FOUND);
    }

    await this.candidaturaRepository.remove(candidatura);
  }

  async getDashboardDados(usuarioId: number): Promise<any> {
    const grupo = await this.findByUsuarioId(usuarioId);

    const candidaturasEnviadas = await this.candidaturaRepository.count({
      where: { grupo: { gruIntId: grupo.gruIntId } }
    });

    const candidaturasAprovadas = await this.candidaturaRepository.count({
      where: { grupo: { gruIntId: grupo.gruIntId }, canStrStatus: StatusCandidatura.Aceita }
    });

    return {
      modulo: 'Painel Acadêmico do Aluno - Osiris',
      grupo: grupo.gruStrNome,
      lider: grupo.gruStrLider,
      metricas: {
        totalCandidaturasEnviadas: candidaturasEnviadas,
        projetosAprovadosPeloEmpreendedor: candidaturasAprovadas
      },
      timestamp: new Date().toISOString()
    };
  }
}