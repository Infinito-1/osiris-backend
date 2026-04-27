import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsBoolean } from 'class-validator';
import { Coordenador } from '../../coordenador/entities/coordenador.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';

@Entity({ name: 'candidaturas' })
export class Candidatura {
  @PrimaryGeneratedColumn({ name: 'can_int_id' })
  canIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'can_str_status', length: 50, nullable: false })
  canStrStatus!: string;

  @IsBoolean()
  @Column({ name: 'can_bool_aprovacao', default: false })
  canBoolAprovacao!: boolean;

  @ManyToOne(() => Coordenador, (coordenador) => coordenador.candidatura)
  @JoinColumn({ name: 'coo_int_id' })
  coordenador!: Coordenador;

  @ManyToOne(() => Demanda, (demanda) => demanda.candidatura)
  @JoinColumn({ name: 'dem_int_id' })
  demanda!: Demanda;

  @ManyToOne(() => Grupo, (grupo) => grupo.candidatura)
  @JoinColumn({ name: 'gru_int_id' })
  grupo!: Grupo;
}
