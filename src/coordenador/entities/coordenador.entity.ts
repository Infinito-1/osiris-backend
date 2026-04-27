import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';

@Entity({ name: 'coordenadores' })
export class Coordenador {
  @PrimaryGeneratedColumn({ name: 'coo_int_id' })
  cooIntId!: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usu_int_id' })
  usuario!: Usuario;

  @IsNotEmpty()
  @Column({ name: 'coo_str_curso', length: 100, nullable: false })
  cooStrCurso!: string;

  @OneToMany(() => Demanda, (demanda) => demanda.coordenador)
  demanda!: Demanda[];

  @OneToMany(() => Candidatura, (candidatura) => candidatura.coordenador)
  candidatura!: Candidatura[];
}
