import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsBoolean } from 'class-validator';

@Entity({ name: 'demandas' })
export class Demanda {
  @PrimaryGeneratedColumn({ name: 'dem_int_id' })
  demIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'emp_int_id', nullable: false })
  empIntId!: number; // FK para tabela empreendedor

  @IsNotEmpty()
  @Column({ name: 'coo_int_id', nullable: false })
  cooIntId!: number; // FK para tabela coordenador

  @IsNotEmpty()
  @Column({ name: 'dem_str_nome', length: 100, nullable: false })
  demStrNome!: string;

  @IsNotEmpty()
  @Column({ name: 'dem_str_descricao', length: 255, nullable: false })
  demStrDescricao!: string;

  @Column({ name: 'dem_int_semestre_recomendado', nullable: true })
  demIntSemestreRecomendado!: number;

  @IsBoolean()
  @Column({ name: 'dem_bool_aceita_mudanca_tipo', default: false })
  demBoolAceitaMudancaTipo!: boolean;

  @IsBoolean()
  @Column({ name: 'dem_bool_aceitacao', default: false })
  demBoolAceitacao!: boolean;
}
