import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'usu_int_id' })
  usuIntId!: number;

  @Column({ name: 'usu_str_nome', type: 'varchar', length: 255 })
  @IsNotEmpty()
  usuStrNome!: string;

  @Column({ name: 'usu_str_email', type: 'varchar', length: 255, unique: true })
  @IsNotEmpty()
  usuStrEmail!: string;

  @Column({ name: 'usu_str_senha', type: 'varchar', length: 255 })
  @IsNotEmpty()
  usuStrSenha!: string;

  @Column({
    name: 'usu_str_telefone',
    type: 'char',
    length: 15,
    nullable: true,
  })
  usuStrTelefone!: string;

  @Column({ name: 'usu_str_tipo', type: 'varchar', length: 50 })
  @IsNotEmpty()
  usuStrTipo!: string;
}
