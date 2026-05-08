import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Demanda } from '../../demanda/entities/demanda.entity';

@Entity({ name: 'semestres' })
export class Semestre {
  @PrimaryGeneratedColumn({ name: 'sem_int_id' })
  semIntId!: number;

  @IsNotEmpty()
  @Column({
    name: 'sem_str_descricao',
    unique: true,
    nullable: false,
    length: 1,
  })
  semStrDescricao!: string;

  @OneToMany(() => Grupo, (grupo) => grupo.semestre)
  grupo!: Grupo[];

  @OneToMany(() => Demanda, (demanda) => demanda.semestre)
  demanda!: Demanda[];
}
