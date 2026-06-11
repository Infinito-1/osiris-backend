import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAcao } from '../entities/log-acao.entity';

export interface RegistrarAcaoOpcoes {
  entidade?: string;
  entidadeId?: number;
  dadosAnteriores?: object;
  destinatarioEmail?: string;
  mensagemNotificacao?: string;
}

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(LogAcao)
    private readonly logRepository: Repository<LogAcao>,
  ) {}

  async registrar(
    acao: string,
    detalhes: string,
    ator: { tipo: 'Admin' | 'Coordenador'; email?: string },
    opcoes?: RegistrarAcaoOpcoes,
  ): Promise<void> {
    const log = this.logRepository.create({
      logStrAcao: acao,
      logStrDetalhes: detalhes,
      logStrAtorTipo: ator.tipo,
      logStrAtorEmail: ator.email,
      logStrEntidade: opcoes?.entidade,
      logIntEntidadeId: opcoes?.entidadeId,
      logStrDadosAnteriores: opcoes?.dadosAnteriores
        ? JSON.stringify(opcoes.dadosAnteriores)
        : undefined,
      logStrDestinatarioEmail: opcoes?.destinatarioEmail,
      logStrMensagemNotificacao: opcoes?.mensagemNotificacao,
      logBoolEmailEnviado: false,
    });
    await this.logRepository.save(log);

    // TODO: ativar quando email de notificação de ações estiver configurado:
    // if (opcoes?.destinatarioEmail && opcoes?.mensagemNotificacao) {
    //   await mailService.sendNotificacaoAcao(opcoes.destinatarioEmail, opcoes.mensagemNotificacao);
    //   log.logBoolEmailEnviado = true;
    //   log.logDateEmailEnviado = new Date();
    //   await this.logRepository.save(log);
    // }
  }

  async listar(): Promise<LogAcao[]> {
    return this.logRepository.find({ order: { logDateCriado: 'DESC' } });
  }
}
