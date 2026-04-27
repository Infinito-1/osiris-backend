import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';

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

  @OneToOne(() => Candidatura)
  @JoinColumn({ name: 'can_int_id' })
  candidatura!: Candidatura;
}
