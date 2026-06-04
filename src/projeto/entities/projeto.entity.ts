import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { HistoricoProjeto } from '../../historico_projeto/entities/historico_projeto.entity';

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

  @Column({ name: 'pro_bool_desativado_coordenador', default: false })
  proBoolDesativadoCoordenador!: boolean;

  @Column({ name: 'pro_str_motivo_desativacao', length: 300, nullable: true })
  proStrMotivoDesativacao?: string | null;

  @OneToOne(() => Candidatura)
  @JoinColumn({ name: 'can_int_id' })
  candidatura!: Candidatura;

  @OneToMany(() => HistoricoProjeto, (historico) => historico.projeto)
  historicos!: HistoricoProjeto[];
}