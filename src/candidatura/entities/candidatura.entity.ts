import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsBoolean } from 'class-validator';

@Entity({ name: 'candidaturas' })
export class Candidatura {
  @PrimaryGeneratedColumn({ name: 'can_int_id' })
  canIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'gru_int_id', nullable: false })
  gruIntId!: number; // FK para tabela grupo

  @IsNotEmpty()
  @Column({ name: 'coo_int_id', nullable: false })
  cooIntId!: number; // FK para tabela coordenador

  @IsNotEmpty()
  @Column({ name: 'dem_int_id', nullable: false })
  demIntId!: number; // FK para tabela demanda

  @IsNotEmpty()
  @Column({ name: 'can_str_status', length: 50, nullable: false })
  canStrStatus!: string;

  @IsBoolean()
  @Column({ name: 'can_bool_aprovacao', default: false })
  canBoolAprovacao!: boolean;
}
