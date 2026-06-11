import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'usu_int_id' })
  usuIntId!: number;

  @Column({ name: 'usu_str_nome', type: 'varchar', length: 255 })
  @IsNotEmpty()
  usuStrNome!: string;

  @Column({ name: 'usu_str_email', type: 'varchar', length: 255, unique: true })
  @IsEmail()
  usuStrEmail!: string;

  @Column({ name: 'usu_str_senha', type: 'varchar', length: 255 })
  @MinLength(6)
  usuStrSenha!: string;

  @Column({ name: 'usu_str_telefone', type: 'char', length: 15, nullable: true })
  usuStrTelefone?: string;

  @Column({
    name: 'usu_str_tipo',
    type: 'enum',
    enum: ['Empreendedor', 'Coordenador', 'Grupo', 'Admin'],
  })
  @IsNotEmpty()
  usuStrTipo!: 'Empreendedor' | 'Coordenador' | 'Grupo' | 'Admin';

  @Column({ name: 'usu_bool_ativo', default: true })
  usuBoolAtivo!: boolean;

  // ===== VERIFICAÇÃO DE EMAIL =====

  @Column({ name: 'usu_bool_confirmado', default: false })
  usuBoolConfirmado!: boolean;

  @Column({
    name: 'usu_str_token_confirmacao',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  usuStrTokenConfirmacao?: string | null;

  @Column({
    name: 'usu_str_codigo_ativacao',
    type: 'varchar',
    length: 6,
    nullable: true
  })
  codigo_ativacao?: string;

  @Column({
    name: 'usu_bool_conta_ativa',
    default: false
  })
  conta_ativa!: boolean;
}