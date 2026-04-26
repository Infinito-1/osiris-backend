import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'historico_hspStrStatus_projeto' })
export class HistoricoProjeto {
  @PrimaryGeneratedColumn({ name: 'hsp_int_id' })
  hspIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'hsp_str_desc', length: 200, nullable: false })
  hspStrDesc!: string;

  @IsNotEmpty()
  @Column({ name: 'hsp_str_link_projeto', length: 200, nullable: false })
  hspStrLinkProjeto!: string;

  @IsNotEmpty()
  @Column({ name: 'hsp_str_hspStrStatus', length: 100, nullable: false })
  hspStrStatus!: string;

  @IsNotEmpty()
  @Column({ name: 'hsp_date_hspDateData', type: 'date', nullable: false })
  hspDateData!: Date;

  // @IsNotEmpty()
  // @Column({ name: 'hsp_str', nullable: false })
  // idProjeto!: number;
}
