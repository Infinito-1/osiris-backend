import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'historico_status_projeto' })
export class HistoricoProjeto {
  @PrimaryGeneratedColumn()
  idHistoricoProjeto!: number;

  @IsNotEmpty()
  @Column({ length: 200, nullable: false })
  descricao!: string;

  @IsNotEmpty()
  @Column({ length: 200, nullable: false })
  linkProjeto!: string;

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  status!: string;

  @IsNotEmpty()
  @Column({ type: 'date', nullable: false })
  data!: Date;

  @IsNotEmpty()
  @Column({ nullable: false })
  idProjeto!: number;
}
