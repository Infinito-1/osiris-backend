import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

//adicionar relacionamentos com tab Usuário, semestre, projetos e candidaturas

@Entity({ name: 'grupos' })
export class Grupo {
  @PrimaryGeneratedColumn({ name: 'gru_int_id' })
  gruIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'gru_str_nome', length: 70, nullable: false })
  gruStrNome!: string;

  @IsNotEmpty()
  @Column({ name: 'gru_str_descricao', length: 300, nullable: false })
  gruStrDescricao!: string;

  @IsNotEmpty()
  @Column({ name: 'gru_int_lider', length: 70, nullable: false })
  gruIntLider!: string;

  @IsNotEmpty()
  @Column({ name: 'gru_cha_ra', length: 13, nullable: false })
  gruChaRa!: string;

  @IsNotEmpty()
  @Column({ name: 'gru_int_tamanho', nullable: false })
  gruIntTamanho!: number;

  @Column({ name: 'gru_str_membros', length: 70 })
  gruStrMembros!: string;
}
