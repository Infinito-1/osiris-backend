import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'logs_acao' })
export class LogAcao {
  @PrimaryGeneratedColumn({ name: 'log_int_id' })
  logIntId!: number;

  @Column({ name: 'log_str_acao', length: 100 })
  logStrAcao!: string;

  @Column({ name: 'log_str_detalhes', type: 'text' })
  logStrDetalhes!: string;

  @Column({ name: 'log_str_entidade', length: 50, nullable: true })
  logStrEntidade?: string;

  @Column({ name: 'log_int_entidade_id', nullable: true })
  logIntEntidadeId?: number;

  @Column({ name: 'log_str_dados_anteriores', type: 'text', nullable: true })
  logStrDadosAnteriores?: string;

  // Quem fez a ação: 'Admin' | 'Coordenador'
  @Column({ name: 'log_str_ator_tipo', length: 20 })
  logStrAtorTipo!: string;

  @Column({ name: 'log_str_ator_email', length: 255, nullable: true })
  logStrAtorEmail?: string;

  // Notificação por email — preenchida, disparada quando ativado
  @Column({ name: 'log_str_destinatario_email', length: 255, nullable: true })
  logStrDestinatarioEmail?: string;

  @Column({
    name: 'log_str_mensagem_notificacao',
    type: 'text',
    nullable: true,
  })
  logStrMensagemNotificacao?: string;

  @Column({ name: 'log_bool_email_enviado', default: false })
  logBoolEmailEnviado!: boolean;

  @Column({ name: 'log_date_email_enviado', nullable: true })
  logDateEmailEnviado?: Date;

  @CreateDateColumn({ name: 'log_date_criado' })
  logDateCriado!: Date;
}
