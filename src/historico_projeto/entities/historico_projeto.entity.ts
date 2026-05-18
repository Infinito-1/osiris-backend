import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Projeto } from '../../projeto/entities/projeto.entity';
import { StatusProjeto } from '../dto/status-projeto.enum';

@Entity({ name: 'historico_status_projeto' })
export class HistoricoProjeto {
  @PrimaryGeneratedColumn({ name: 'hsp_int_id' })
  hspIntId!: number;

  @Column({ name: 'hsp_str_desc', length: 200, nullable: false })
  @IsNotEmpty()
  hspStrDesc!: string;

  @Column({ name: 'hsp_str_link_projeto', length: 200, nullable: false })
  @IsNotEmpty()
  hspStrLinkProjeto!: string;

  @Column({ name: 'hsp_str_status', type: 'enum', enum: StatusProjeto, nullable: false })
  @IsNotEmpty()
  hspStrStatus!: StatusProjeto;

  @UpdateDateColumn({ name: 'hsp_date_data', type: 'timestamp' })
  hspDateData!: Date;

  @ManyToOne(() => Projeto, (projeto) => projeto.historicos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pro_int_id' })
  projeto!: Projeto;
}