/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coordenador } from '../entities/coordenador.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { CreateCoordenadorDto } from '../dto/create-coordenador.dto';
import { UpdateCoordenadorDto } from '../dto/update-coordenador.dto';
import { ClassificarDemandaDto } from '../dto/classificar-demanda.dto';
import { GerenciarCandidaturaDto } from '../dto/gerenciar-candidatura.dto';
import { MailService } from '../../mail/mail.service';
import { LogService } from '../../log/services/log.service';

@Injectable()
export class CoordenadorService {
  constructor(
    @InjectRepository(Coordenador)
    private readonly coordenadorRepository: Repository<Coordenador>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Demanda)
    private readonly demandaRepository: Repository<Demanda>,
    @InjectRepository(Candidatura)
    private readonly candidaturaRepository: Repository<Candidatura>,
    private readonly mailService: MailService,
    private readonly logService: LogService,
  ) {}

  private async log(
    acao: string,
    entidade: string,
    entidadeId: number,
    snapshot: object,
    atorEmail: string,
    destinatarioEmail?: string,
    mensagem?: string,
  ) {
    await this.logService.registrar(
      acao,
      `Coordenador (${atorEmail}) realizou: ${acao} em ${entidade} ID=${entidadeId}`,
      { tipo: 'Coordenador', email: atorEmail },
      {
        entidade,
        entidadeId,
        dadosAnteriores: snapshot,
        destinatarioEmail,
        mensagemNotificacao: mensagem,
      },
    );
  }

  async findAll(): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({ relations: ['usuario'] });
  }

  async findById(id: number): Promise<Coordenador> {
    const coordenador = await this.coordenadorRepository.findOne({
      where: { cooIntId: id },
      relations: ['usuario'],
    });
    if (!coordenador) {
      throw new HttpException(
        'Coordenador não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }
    return coordenador;
  }

  async findByUsuarioId(usuarioId: number): Promise<Coordenador> {
    const coordenador = await this.coordenadorRepository.findOne({
      where: { usuario: { usuIntId: usuarioId } },
      relations: ['usuario'],
    });
    if (!coordenador) {
      throw new HttpException(
        'Perfil de coordenador não encontrado para este utilizador.',
        HttpStatus.NOT_FOUND,
      );
    }
    return coordenador;
  }

  async findByCurso(curso: string): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({
      where: { cooStrCurso: curso },
      relations: ['usuario'],
    });
  }

  async create(dto: CreateCoordenadorDto): Promise<Coordenador> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuIntId: dto.usuIntId },
    });
    if (!usuario) {
      throw new HttpException(
        'Usuário base não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    usuario.usuStrTipo = 'Coordenador';
    await this.usuarioRepository.save(usuario);

    const coordenador = this.coordenadorRepository.create({
      cooStrCurso: dto.cooStrCurso,
      usuario: usuario,
    });

    return this.coordenadorRepository.save(coordenador);
  }

  async update(id: number, dto: UpdateCoordenadorDto): Promise<Coordenador> {
    const coordenador = await this.findById(id);

    if (dto.cooStrCurso) {
      coordenador.cooStrCurso = dto.cooStrCurso;
    }

    if (dto.usuIntId) {
      const novoUsuario = await this.usuarioRepository.findOne({
        where: { usuIntId: dto.usuIntId },
      });
      if (!novoUsuario) {
        throw new HttpException(
          'Novo usuário associado não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      coordenador.usuario = novoUsuario;
    }

    return this.coordenadorRepository.save(coordenador);
  }

  async inativar(id: number): Promise<Coordenador> {
    const coordenador = await this.coordenadorRepository.findOne({
      where: { cooIntId: id },
      relations: ['usuario'],
    });
    if (!coordenador) {
      throw new HttpException(
        'Coordenador não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    if (coordenador.usuario) {
      coordenador.usuario.usuBoolAtivo = false;
      await this.usuarioRepository.save(coordenador.usuario);
    }

    return this.coordenadorRepository.save(coordenador);
  }

  async delete(id: number): Promise<void> {
    const coordenador = await this.findById(id);
    await this.coordenadorRepository.remove(coordenador);
  }

  async classificarDemanda(
    demIntId: number,
    dto: ClassificarDemandaDto,
  ): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId },
      relations: ['semestre'],
    });

    if (!demanda) {
      throw new HttpException(
        'Demanda informada para classificação não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    demanda.demStrSemestreRecomendado = dto.semestre;
    demanda.demStrAreaTecnica = dto.areaTecnica;

    const apenasNumeros = dto.semestre.replace(/\D/g, '');
    const numeroSemestre = parseInt(apenasNumeros);
    if (!isNaN(numeroSemestre) && numeroSemestre >= 1 && numeroSemestre <= 6) {
      demanda.semestre = { semIntId: numeroSemestre } as any;
    }

    return this.demandaRepository.save(demanda);
  }

  async aprovarDemanda(demIntId: number, atorEmail: string): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId },
      relations: ['empreendedor', 'empreendedor.usuario'],
    });

    if (!demanda) {
      throw new HttpException(
        'Demanda informada para aprovação não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!demanda.demStrSemestreRecomendado || !demanda.demStrAreaTecnica) {
      throw new HttpException(
        'Aprovação bloqueada: A demanda precisa ser previamente Classificada',
        HttpStatus.BAD_REQUEST,
      );
    }

    demanda.demBoolAceitacao = true;
    demanda.demBoolAtivo = true;

    const demandaSalva = await this.demandaRepository.save(demanda);

    await this.log(
      'Aprovar Demanda',
      'Demanda',
      demIntId,
      { demStrNome: demanda.demStrNome },
      atorEmail,
      demanda.empreendedor?.usuario?.usuStrEmail,
      `Sua demanda "${demanda.demStrNome}" foi aprovada e publicada na galeria.`,
    );

    if (demanda.empreendedor?.usuario?.usuStrEmail) {
      try {
        // Passando 'COORDENADOR' pois a ação vem do Coordenador
        await this.mailService.sendDemandaAprovadaEmail(
          'COORDENADOR',
          demanda.empreendedor.usuario.usuStrEmail,
          demanda.demStrNome,
        );
      } catch (error) {
        console.error(
          'Falha ao enviar e-mail de notificação de aprovação:',
          error,
        );
      }
    }

    return demandaSalva;
  }

  async rejeitarDemanda(
    demIntId: number,
    atorEmail: string,
    motivo?: string,
  ): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({
      where: { demIntId },
      relations: ['empreendedor', 'empreendedor.usuario'],
    });
    if (!demanda)
      throw new HttpException(
        'Demanda informada para rejeição não encontrada',
        HttpStatus.NOT_FOUND,
      );

    demanda.demBoolAceitacao = false;
    demanda.demBoolAtivo = false;
    demanda.demStrMotivoRejeicao = motivo ?? undefined;
    const demandaSalva = await this.demandaRepository.save(demanda);

    await this.log(
      'Rejeitar Demanda',
      'Demanda',
      demIntId,
      { demStrNome: demanda.demStrNome, motivo },
      atorEmail,
      demanda.empreendedor?.usuario?.usuStrEmail,
      `Sua demanda "${demanda.demStrNome}" foi rejeitada. Motivo: ${motivo ?? 'não informado'}.`,
    );

    if (demanda.empreendedor?.usuario?.usuStrEmail) {
      try {
        // reutiliza o mail de aprovação — idealmente criar sendDemandaRejeitadaEmail no MailService
        await this.mailService.sendDemandaAprovadaEmail(
          demanda.empreendedor.usuario.usuStrEmail,
          demanda.demStrNome,
        );
      } catch (error) {
        console.error('Falha ao enviar e-mail de rejeição:', error);
      }
    }
    return demandaSalva;
  }

  async gerenciarCandidaturas(
    dto: GerenciarCandidaturaDto,
    atorEmail: string,
  ): Promise<Candidatura> {
    const candidatura = await this.candidaturaRepository.findOne({
      where: { canIntId: dto.candidaturaId },
      relations: ['demanda', 'grupo', 'grupo.usuario'],
    });

    if (!candidatura) {
      throw new HttpException(
        'Candidatura selecionada não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    candidatura.canStrStatus = dto.status;
    candidatura.canBoolAprovacao = dto.status === 'Aceita';

    if (dto.status === 'Aceita' && candidatura.demanda) {
      candidatura.demanda.demBoolAceitacao = true;
      await this.demandaRepository.save(candidatura.demanda);
    }

    const candidaturaSalva = await this.candidaturaRepository.save(candidatura);

    await this.log(
      `${dto.status === 'Aceita' ? 'Aceitar' : 'Recusar'} Candidatura`,
      'Candidatura',
      dto.candidaturaId,
      { canStrStatus: dto.status, demStrNome: candidatura.demanda?.demStrNome },
      atorEmail,
      candidatura.grupo?.usuario?.usuStrEmail,
      `Sua candidatura para "${candidatura.demanda?.demStrNome}" foi ${dto.status === 'Aceita' ? 'aceita' : 'recusada'}.`,
    );

    if (candidatura.grupo?.usuario?.usuStrEmail) {
      try {
        // Passando 'COORDENADOR' pois a ação vem do Coordenador
        await this.mailService.sendStatusCandidaturaEmail(
          'COORDENADOR',
          candidatura.grupo.usuario.usuStrEmail,
          candidatura.demanda?.demStrNome || 'Demanda Vinculada',
          dto.status,
        );
      } catch (error) {
        console.error(
          'Falha ao enviar e-mail de alteração de status da candidatura:',
          error,
        );
      }
    }

    return candidaturaSalva;
  }

  async getDashboardDados(usuarioId: number): Promise<any> {
    const coordenador = await this.findByUsuarioId(usuarioId);
    const demandasPendentes = await this.demandaRepository.count({
      where: { demBoolAceitacao: false },
    });
    const demandasAtivas = await this.demandaRepository.count({
      where: { demBoolAceitacao: true, demBoolAtivo: true },
    });
    const totalCandidaturas = await this.candidaturaRepository.count();
    const totalRejeitadas = await this.demandaRepository.count({
      where: { demBoolAceitacao: false, demBoolAtivo: false },
    });
    const listaPendentes = await this.demandaRepository.find({
      where: { demBoolAceitacao: false, demBoolAtivo: true },
      relations: ['empreendedor', 'empreendedor.usuario', 'tipo'],
      order: { demDataCriacao: 'DESC' },
    });

    const listaAtivas = await this.demandaRepository.find({
      where: { demBoolAceitacao: true, demBoolAtivo: true },
      relations: [
        'empreendedor',
        'empreendedor.usuario',
        'tipo',
        'candidatura',
        'candidatura.grupo',
      ],
      order: { demDataCriacao: 'DESC' },
    });

    const listaRejeitadas = await this.demandaRepository.find({
      where: { demBoolAceitacao: false, demBoolAtivo: false },
      relations: ['empreendedor', 'empreendedor.usuario', 'tipo'],
      order: { demDataCriacao: 'DESC' },
    });

    const formatarDemanda = (d: any) => ({
      id: d.demIntId,
      nome: d.demStrNome,
      descricao: d.demStrDescricao,
      ativo: d.demBoolAtivo,
      aceitacao: d.demBoolAceitacao,
      semestreRecomendado: d.demStrSemestreRecomendado ?? null,
      areaTecnica: d.demStrAreaTecnica ?? null,
      tipos: d.tipo?.map((t: any) => t.tipStrNome) ?? [],
      empreendedor: d.empreendedor
        ? {
            nome: d.empreendedor.usuario?.usuStrNome ?? '—',
            empresa: d.empreendedor.empStrEmpresa ?? '—',
          }
        : null,
      grupos:
        d.candidatura
          ?.filter((c: any) => c.grupo)
          .map((c: any) => c.grupo.gruStrNome) ?? [],
    });

    return {
      coordenador: coordenador.cooStrCurso,
      nome: coordenador.usuario?.usuStrNome ?? '—',
      email: coordenador.usuario?.usuStrEmail ?? '—',
      metricas: {
        demandasPendentesDeAprovacao: demandasPendentes,
        demandasPublicadasGaleria: demandasAtivas,
        totalDeCandidaturasSubmetidas: totalCandidaturas,
        demandasRejeitadas: totalRejeitadas,
      },
      demandas: {
        pendentes: listaPendentes.map(formatarDemanda),
        ativas: listaAtivas.map(formatarDemanda),
        rejeitadas: listaRejeitadas.map(formatarDemanda),
      },
    };
  }
}
