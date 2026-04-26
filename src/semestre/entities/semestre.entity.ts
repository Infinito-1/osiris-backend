import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

//adicionar relacionamentos com tab grupo, projetos e candidaturas

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
}
