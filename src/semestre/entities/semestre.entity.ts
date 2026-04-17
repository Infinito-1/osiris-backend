import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

//adicionar relacionamentos com tab grupo, projetos e candidaturas

@Entity({ name: 'semestres' })
export class Semestre {
  @PrimaryGeneratedColumn()
  idSemestre!: number;

  @IsNotEmpty()
  @Column({ length: 1, nullable: false })
  descricaoSemestre!: string;
}
