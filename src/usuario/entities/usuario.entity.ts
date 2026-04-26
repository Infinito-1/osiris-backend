import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'usu_int_id' })
  usu_int_id: number;

  @Column({ name: 'usu_str_nome', type: 'varchar', length: 255 })
  @IsNotEmpty()
  usu_str_nome: string;

  @Column({ name: 'usu_str_email', type: 'varchar', length: 255, unique: true })
  @IsNotEmpty()
  usu_str_email: string;

  @Column({ name: 'usu_str_senha', type: 'varchar', length: 255 })
  @IsNotEmpty()
  usu_str_senha: string;

  @Column({ name: 'usu_str_telefone', type: 'char', length: 15, nullable: true })
  usu_str_telefone: string;

  @Column({ name: 'usu_str_tipo', type: 'varchar', length: 50 })
  @IsNotEmpty()
  usu_str_tipo: string;
}
