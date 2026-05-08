import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Demanda } from '../../demanda/entities/demanda.entity';

@Entity({ name: 'tipo_demanda' })
export class TipoDemanda {
  @PrimaryGeneratedColumn({ name: 'tip_int_id' })
  tipIntId!: number;

  @IsNotEmpty()
  @Column({
    name: 'tip_str_nome',
    length: 100,
    nullable: false,
    unique: true,
  })
  tipStrNome!: string;

  @ManyToMany(() => Demanda, (demanda) => demanda.tipo)
  demandas!: Demanda[];
}
