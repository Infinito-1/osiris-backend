import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'historico_status_projeto' })
export class HistoricoProjeto {
  @PrimaryGeneratedColumn()
  hsp_int_id!: number;

  @IsNotEmpty()
  @Column({ length: 200, nullable: false })
  hsp_str_desc!: string;

  @IsNotEmpty()
  @Column({ length: 200, nullable: false })
  hsp_str_link_projeto!: string;

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  hsp_status!: string;

  @IsNotEmpty()
  @Column({ type: 'date', nullable: false })
  hsp_date_data!: Date;

  @IsNotEmpty()
  @Column({ nullable: false })
  pro_int_id!: number;
}
