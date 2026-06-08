import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsBoolean } from 'class-validator';
import { Coordenador } from '../../coordenador/entities/coordenador.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { StatusCandidatura } from '../dto/status.enum';
import { Projeto } from '../../projeto/entities/projeto.entity';

@Entity({ name: 'candidaturas' })
export class Candidatura {
  @PrimaryGeneratedColumn({ name: 'can_int_id' })
  canIntId!: number;

  @Column({
    name: 'can_str_status',
    type: 'enum',
    enum: StatusCandidatura,
    default: StatusCandidatura.Pendente,
  })
  canStrStatus!: StatusCandidatura;

  @IsBoolean()
  @Column({ name: 'can_bool_aprovacao', default: false })
  canBoolAprovacao!: boolean;

  @ManyToOne(() => Coordenador, (coordenador) => coordenador.candidatura, {
    nullable: true,
  })
  @JoinColumn({ name: 'coo_int_id' })
  coordenador?: Coordenador;

  @ManyToOne(() => Demanda, (demanda) => demanda.candidatura)
  @JoinColumn({ name: 'dem_int_id' })
  demanda!: Demanda;

  @ManyToOne(() => Grupo, (grupo) => grupo.candidatura)
  @JoinColumn({ name: 'gru_int_id' })
  grupo!: Grupo;

  @OneToOne(() => Projeto, (projeto) => projeto.candidatura)
  projeto?: Projeto;
}
