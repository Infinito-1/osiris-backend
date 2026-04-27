import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Demanda } from '../../demanda/entities/demanda.entity';

@Entity({ name: 'tipo_demanda' })
export class TipoDemanda {
  @PrimaryGeneratedColumn({ name: 'tip_int_id' })
  tipIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'tip_str_tipStrNome', length: 100, nullable: false })
  tipStrNome!: string;

  @ManyToMany(() => Demanda, (demanda) => demanda.tipo)
  demanda!: Demanda[];
}
