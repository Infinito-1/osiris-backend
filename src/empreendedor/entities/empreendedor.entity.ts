import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@Entity({ name: 'empreendedores' }) // 👈 nome da tabela no banco
export class Empreendedor {
  @PrimaryGeneratedColumn({ name: 'emp_int_id' })
  empIntId!: number;

  @IsNotEmpty()
  @Column({ name: 'usu_int_id', nullable: false })
  usuIntId!: number; // FK para tabela usuário (quando você criar a relação)

  @IsNotEmpty()
  @IsString()
  @Column({ name: 'emp_str_empresa', length: 100, nullable: false })
  empStrEmpresa!: string;

  @IsNotEmpty()
  @IsString()
  @Length(14, 14) // CNPJ sempre tem 14 caracteres
  @Column({ name: 'emp_cha_cnpj', type: 'char', length: 14, nullable: false })
  empChaCnpj!: string;
}
