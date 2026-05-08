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

@Entity({ name: 'historico_status_projeto' })
export class HistoricoProjeto {
  @PrimaryGeneratedColumn({ name: 'hsp_int_id' })
  hspIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'hsp_str_desc', length: 200, nullable: false })
  hspStrDesc!: string; // descrição da atualização

  @IsNotEmpty()
  @Column({ name: 'hsp_str_link_projeto', length: 200, nullable: false })
  hspStrLinkProjeto!: string; // link do repositório ou deploy

  @IsNotEmpty()
  @Column({ name: 'hsp_str_status', length: 100, nullable: false })
  hspStrStatus!: string; // status do projeto

  @UpdateDateColumn({ name: 'hsp_date_data', type: 'timestamp' })
  hspDateData!: Date; // data da atualização

  @ManyToOne(() => Projeto, (projeto) => projeto.historicos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pro_int_id' })
  projeto!: Projeto;
}
