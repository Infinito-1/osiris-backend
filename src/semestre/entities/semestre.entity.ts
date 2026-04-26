import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

//adicionar relacionamentos com tab grupo, projetos e candidaturas

@Entity({ name: 'semestres' })
export class Semestre {
  @PrimaryGeneratedColumn()
  idSemestre!: number;

  @IsNotEmpty()
  @Column({ unique: true, nullable: false, length: 1 })
  descricaoSemestre!: string;
}
