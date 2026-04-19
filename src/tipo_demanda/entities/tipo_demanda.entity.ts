import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'tipo_demanda' })
export class TipoDemanda {
  @PrimaryGeneratedColumn()
  tip_int_id!: number;

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  tip_str_nome!: string;
}
