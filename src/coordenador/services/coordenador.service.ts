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
  ) {}

  async findAll(): Promise<Coordenador[]> {
    return this.coordenadorRepository.find({ relations: ['usuario'] });
  }

  async findById(id: number): Promise<Coordenador> {
    const coordenador = await this.coordenadorRepository.findOne({
      where: { cooIntId: id },
      relations: ['usuario'],
    });
    if (!coordenador) {
      throw new HttpException('Coordenador não encontrado', HttpStatus.NOT_FOUND);
    }
    return coordenador;
  }

  async findByUsuarioId(usuarioId: number): Promise<Coordenador> {
    const coordenador = await this.coordenadorRepository.findOne({
      where: { usuario: { usuIntId: usuarioId } },
      relations: ['usuario'],
    });
    if (!coordenador) {
      throw new HttpException('Perfil de coordenador não encontrado para este utilizador.', HttpStatus.NOT_FOUND);
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
    const usuario = await this.usuarioRepository.findOne({ where: { usuIntId: dto.usuIntId } });
    if (!usuario) {
      throw new HttpException('Usuário base não encontrado', HttpStatus.NOT_FOUND);
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
      const novoUsuario = await this.usuarioRepository.findOne({ where: { usuIntId: dto.usuIntId } });
      if (!novoUsuario) {
        throw new HttpException('Novo usuário associado não encontrado', HttpStatus.NOT_FOUND);
      }
      coordenador.usuario = novoUsuario;
    }

    return this.coordenadorRepository.save(coordenador);
  }

  async inativar(id: number): Promise<Coordenador> {
    const coordenador = await this.coordenadorRepository.findOne({ 
      where: { cooIntId: id },
      relations: ['usuario'] 
    });
    if (!coordenador) {
      throw new HttpException('Coordenador não encontrado', HttpStatus.NOT_FOUND);
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

  async classificarDemanda(demIntId: number, dto: ClassificarDemandaDto): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ 
      where: { demIntId },
      relations: ['semestre']
    });
    
    if (!demanda) {
      throw new HttpException('Demanda informada para classificação não encontrada', HttpStatus.NOT_FOUND);
    }

    demanda.demStrSemestreRecomendado = dto.semestre; 
    demanda.demStrAreaTecnica = dto.areaTecnica;     
    demanda.demStrTipagem = dto.tipagem;             

    const apenasNumeros = dto.semestre.replace(/\D/g, '');
    const numeroSemestre = parseInt(apenasNumeros);
    if (!isNaN(numeroSemestre) && numeroSemestre >= 1 && numeroSemestre <= 6) {
      demanda.semestre = { semIntId: numeroSemestre } as any;
    }

    return this.demandaRepository.save(demanda);
  }

  async aprovarDemanda(demIntId: number): Promise<Demanda> {
    const demanda = await this.demandaRepository.findOne({ 
      where: { demIntId },
      relations: ['empreendedor', 'empreendedor.usuario']
    });

    if (!demanda) {
      throw new HttpException('Demanda informada para aprovação não encontrada', HttpStatus.NOT_FOUND);
    }

    if (!demanda.demStrSemestreRecomendado || !demanda.demStrAreaTecnica) {
      throw new HttpException(
        'Aprovação bloqueada: A demanda precisa ser previamente Classificada (Semestre Recomendado e Área Técnica preenchidos)',
        HttpStatus.BAD_REQUEST,
      );
    }

    demanda.demBoolAceitacao = true; 
    demanda.demBoolAtivo = true;     

    const demandaSalva = await this.demandaRepository.save(demanda);

    if (demanda.empreendedor?.usuario?.usuStrEmail) {
      try {
        await this.mailService.sendDemandaAprovadaEmail(
          demanda.empreendedor.usuario.usuStrEmail,
          demanda.demStrNome,
        );
      } catch (error) {
        console.error('Falha ao enviar e-mail de notificação de aprovação:', error);
      }
    }

    return demandaSalva;
  }

  async gerenciarCandidaturas(dto: GerenciarCandidaturaDto): Promise<Candidatura> {
    const candidatura = await this.candidaturaRepository.findOne({ 
      where: { canIntId: dto.candidaturaId },
      relations: ['demanda', 'grupo', 'grupo.usuario']
    });

    if (!candidatura) {
      throw new HttpException('Candidatura selecionada não encontrada', HttpStatus.NOT_FOUND);
    }

    candidatura.canStrStatus = dto.status;
    candidatura.canBoolAprovacao = dto.status === 'Aceita';

    if (dto.status === 'Aceita' && candidatura.demanda) {
      candidatura.demanda.demBoolAceitacao = true;
      await this.demandaRepository.save(candidatura.demanda);
    }

    const candidaturaSalva = await this.candidaturaRepository.save(candidatura);

    if (candidatura.grupo?.usuario?.usuStrEmail) {
      try {
        await this.mailService.sendStatusCandidaturaEmail(
          candidatura.grupo.usuario.usuStrEmail,
          candidatura.demanda?.demStrNome || 'Demanda Vinculada',
          dto.status,
        );
      } catch (error) {
        console.error('Falha ao enviar e-mail de alteração de status da candidatura:', error);
      }
    }

    return candidaturaSalva;
  }

  async getDashboardDados(usuarioId: number): Promise<any> {
    const coordenador = await this.findByUsuarioId(usuarioId);
    const demandasPendentes = await this.demandaRepository.count({ where: { demBoolAceitacao: false } });
    const demandasAtivas = await this.demandaRepository.count({ where: { demBoolAceitacao: true, demBoolAtivo: true } });
    const totalCandidaturas = await this.candidaturaRepository.count();

    return {
      modulo: 'Painel Gerencial de Coordenação - Osiris',
      coordenador: coordenador.cooStrCurso,
      metricas: {
        demandasPendentesDeAprovacao: demandasPendentes,
        demandasPublicadasGaleria: demandasAtivas,
        totalDeCandidaturasSubmetidas: totalCandidaturas
      },
      timestamp: new Date().toISOString(),
    };
  }
}