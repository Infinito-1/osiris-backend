import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'tipo_demanda' })
export class TipoDemanda {
  @PrimaryGeneratedColumn({ name: 'tip_int_id' })
  tipIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'tip_str_tipStrNome', length: 100, nullable: false })
  tipStrNome!: string;
}
