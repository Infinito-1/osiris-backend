import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'tipo_demanda' })
export class TipoDemanda {
  @PrimaryGeneratedColumn()
  idTipoDemanda!: number;

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  nome!: string;
}
