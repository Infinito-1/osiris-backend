import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Demanda } from '../../demanda/entities/demanda.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'empreendedores' })
export class Empreendedor {
  @PrimaryGeneratedColumn({ name: 'emp_int_id' })
  empIntId!: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usu_int_id' })
  usuario!: Usuario;

  @IsNotEmpty()
  @IsString()
  @Column({ name: 'emp_str_empresa', length: 100, nullable: false })
  empStrEmpresa!: string;

  @IsNotEmpty()
  @IsString()
  @Length(14, 14) // CNPJ sempre tem 14 caracteres
  @Column({ name: 'emp_cha_cnpj', type: 'char', length: 14, nullable: false })
  empChaCnpj!: string;

  @OneToMany(() => Demanda, (demanda) => demanda.empreendedor)
  demanda!: Demanda[];
}
