import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsBoolean, IsString } from 'class-validator';
import { Empreendedor } from '../../empreendedor/entities/empreendedor.entity';
import { Coordenador } from '../../coordenador/entities/coordenador.entity';
import { Candidatura } from '../../candidatura/entities/candidatura.entity';
import { Semestre } from '../../semestre/entities/semestre.entity';
import { TipoDemanda } from '../../tipo_demanda/entities/tipo_demanda.entity';

@Entity({ name: 'demandas' })
export class Demanda {
  @PrimaryGeneratedColumn({ name: 'dem_int_id' })
  demIntId!: number;

  @IsNotEmpty()
  @IsString()
  @Column({ name: 'dem_str_nome', length: 100, nullable: false })
  demStrNome!: string;

  @IsNotEmpty()
  @IsString()
  @Column({ name: 'dem_str_descricao', length: 255, nullable: false })
  demStrDescricao!: string;

  @ManyToOne(() => Semestre, (semestre) => semestre.demanda)
  @JoinColumn({ name: 'sem_int_id' })
  semestre!: Semestre;

  @IsBoolean()
  @Column({ name: 'dem_bool_aceita_mudanca_tipo', default: false })
  demBoolAceitaMudancaTipo!: boolean;

  @IsBoolean()
  @Column({ name: 'dem_bool_aceitacao', default: false })
  demBoolAceitacao!: boolean;

  @CreateDateColumn({ name: 'dem_data_criacao' })
  demDataCriacao!: Date;

  @IsBoolean()
  @Column({ name: 'dem_bool_ativo', default: true })
  demBoolAtivo!: boolean;

  // 🔹 Campos adicionados para classificação (UC-03)
  @Column({ name: 'dem_str_semestre_recomendado', length: 20, nullable: true })
  demStrSemestreRecomendado?: string;

  @Column({ name: 'dem_str_area_tecnica', length: 100, nullable: true })
  demStrAreaTecnica?: string;

  @ManyToMany(() => TipoDemanda, (tipo) => tipo.demandas)
  @JoinTable({
    name: 'demanda_tipo_demanda',
    joinColumn: { name: 'dem_int_id', referencedColumnName: 'demIntId' },
    inverseJoinColumn: { name: 'tip_int_id', referencedColumnName: 'tipIntId' },
  })
  tipo!: TipoDemanda[];

  @ManyToOne(() => Empreendedor, (empreendedor) => empreendedor.demanda)
  @JoinColumn({ name: 'emp_int_id' })
  empreendedor!: Empreendedor;

  @ManyToOne(() => Coordenador, (coordenador) => coordenador.demanda)
  @JoinColumn({ name: 'coo_int_id' })
  coordenador!: Coordenador;

  @OneToMany(() => Candidatura, (candidatura) => candidatura.demanda)
  candidatura!: Candidatura[];
}
