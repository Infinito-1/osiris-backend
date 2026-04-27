import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Projeto } from '../../projeto/entities/projeto.entity';

@Entity({ name: 'historico_hspStrStatus_projeto' })
export class HistoricoProjeto {
  @PrimaryGeneratedColumn({ name: 'hsp_int_id' })
  hspIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'hsp_str_desc', length: 200, nullable: false })
  hspStrDesc!: string;

  @IsNotEmpty()
  @Column({ name: 'hsp_str_link_projeto', length: 200, nullable: false })
  hspStrLinkProjeto!: string;

  @IsNotEmpty()
  @Column({ name: 'hsp_str_status', length: 100, nullable: false })
  hspStrStatus!: string;

  @UpdateDateColumn()
  @Column({ name: 'hsp_date_data', type: 'date', nullable: false })
  hspDateData!: Date;

  @OneToOne(() => Projeto)
  @JoinColumn({ name: 'pro_int_id' })
  projeto!: Projeto;
}
