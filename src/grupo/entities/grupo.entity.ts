import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

//adicionar relacionamentos com tab Usuário, semestre, projetos e candidaturas

@Entity({ name: 'grupos' })
export class Grupo {
  @PrimaryGeneratedColumn()
  idGrupo!: number;

  @IsNotEmpty()
  @Column({ length: 70, nullable: false })
  nomeGrupo!: string;

  @IsNotEmpty()
  @Column({ length: 300, nullable: false })
  descricaoGrupo!: string;

  @IsNotEmpty()
  @Column({ length: 70, nullable: false })
  liderGrupo!: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  tamanhoGrupo!: number;

  @Column({ length: 70 })
  integrantesGrupo!: string;
}
