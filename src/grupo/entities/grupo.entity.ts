import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { Semestre } from '../../semestre/entities/semestre.entity';

@Entity({ name: 'grupos' })
export class Grupo {
  @PrimaryGeneratedColumn({ name: 'gru_int_id' })
  gruIntId!: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usu_int_id' })
  usuario!: Usuario;

  @IsNotEmpty()
  @Column({ name: 'gru_str_nome', length: 70, nullable: false })
  gruStrNome!: string;

  @IsNotEmpty()
  @Column({ name: 'gru_str_descricao', length: 300, nullable: false })
  gruStrDescricao!: string;

  @IsNotEmpty()
  @Column({ name: 'gru_str_lider', length: 70, nullable: false })
  gruStrLider!: string; // 🛠️ Corrigido o tipo para string refletindo o nome do líder

  @IsNotEmpty()
  @Column({ name: 'gru_cha_ra', length: 13, nullable: false })
  gruChaRa!: string;

  @IsNotEmpty()
  @Column({ name: 'gru_int_tamanho', nullable: false })
  gruIntTamanho!: number;

  @Column({ name: 'gru_str_membros', length: 200, nullable: true })
  gruStrMembros?: string;

  @Column({ name: 'gru_bool_ativo', default: true })
  gruBoolAtivo!: boolean;

  @Column({ name: 'gru_str_portfolio', length: 300, nullable: true })
  gruStrPortfolio?: string;

  @OneToMany(() => Candidatura, (candidatura) => candidatura.grupo)
  candidatura!: Candidatura[];

  @ManyToOne(() => Semestre, (semestre) => semestre.grupo)
  @JoinColumn({ name: 'sem_int_id' })
  semestre!: Semestre;
}