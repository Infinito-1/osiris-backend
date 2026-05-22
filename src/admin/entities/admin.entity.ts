import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean } from 'class-validator';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'admins' })
export class Admin {
  @PrimaryGeneratedColumn({ name: 'adm_int_id' })
  admIntId!: number;

  @IsBoolean()
  @Column({ name: 'adm_bool_ativo', default: true })
  admBoolAtivo!: boolean;

  // Ajustado com regras de integridade relacional cascade
  @OneToOne(() => Usuario, { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'usu_int_id' })
  usuario!: Usuario;
}
