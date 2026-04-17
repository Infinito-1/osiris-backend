import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, Matches } from 'class-validator';

@Entity({ name: 'empreendedores' })
export class Empreendedor {
  @PrimaryGeneratedColumn()
  idEmpreendedor!: number;

  @IsNotEmpty()
  @Column({ nullable: false })
  usuarioId!: number; // FK para tabela usuário

  @IsNotEmpty()
  @Column({ length: 100, nullable: false })
  empresa!: string;

  @IsNotEmpty()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter exatamente 14 dígitos numéricos' })
  @Column({ length: 14, nullable: false })
  cnpj!: string;
}
