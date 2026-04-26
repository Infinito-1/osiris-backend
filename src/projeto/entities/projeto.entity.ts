import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'projeto' })
export class Projeto {
  @PrimaryGeneratedColumn({ name: 'pro_int_id' })
  pro_int_id: number;

  @Column({ name: 'pro_str_descricao', type: 'varchar', length: 255 })
  @IsNotEmpty()
  pro_str_descricao: string;

  @Column({ name: 'pro_date_inicio', type: 'date' })
  @IsNotEmpty()
  pro_date_inicio: Date;

  @Column({ name: 'can_int_id', type: 'int' })
  @IsNotEmpty()
  can_int_id: number; // Foreign Key para Candidatura
}
