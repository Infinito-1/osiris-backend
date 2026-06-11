import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { HistoricoProjeto } from '../../historico_projeto/entities/historico_projeto.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';

@Entity({ name: 'projeto' })
export class Projeto {
  @PrimaryGeneratedColumn({ name: 'pro_int_id' })
  proIntId!: number;

  @Column({ name: 'pro_str_descricao', type: 'varchar', length: 255 })
  @IsNotEmpty()
  proStrDescricao!: string;

  @Column({ name: 'pro_date_inicio', type: 'date' })
  @IsNotEmpty()
  proDateInicio!: Date;

  @Column({ name: 'pro_bool_ativo', type: 'boolean', default: true })
  proBoolAtivo!: boolean;

  @Column({
    name: 'pro_bool_desativado_coordenador',
    type: 'boolean',
    default: false,
  })
  proBoolDesativadoCoordenador!: boolean;

  @Column({
    name: 'pro_str_motivo_desativacao',
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  proStrMotivoDesativacao?: string | null;

  @ManyToOne(() => Grupo, { nullable: true, eager: false })
  @JoinColumn({ name: 'gru_int_id' })
  grupo?: Grupo | null;

  @OneToOne(() => Candidatura, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'can_int_id' })
  candidatura!: Candidatura | null;

  @OneToMany(() => HistoricoProjeto, (historico) => historico.projeto)
  historicos!: HistoricoProjeto[];
}
