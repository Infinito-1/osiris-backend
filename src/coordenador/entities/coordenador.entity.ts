import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'coordenadores' })
export class Coordenador {
  @PrimaryGeneratedColumn({ name: 'coo_int_id' })
  cooIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'usu_int_id', nullable: false })
  usuIntId!: number; // FK para tabela usuário

  @IsNotEmpty()
  @Column({ name: 'coo_str_curso', length: 100, nullable: false })
  cooStrCurso!: string;
}
