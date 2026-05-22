import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePapelDto {
  @ApiProperty({ 
    example: 'Coordenador', 
    enum: ['Empreendedor', 'Coordenador', 'Grupo', 'Admin'],
    description: 'Novo papel a ser atribuído ao usuário pelo Administrador'
  })
  @IsNotEmpty()
  @IsEnum(['Empreendedor', 'Coordenador', 'Grupo', 'Admin'], {
    message: 'O papel deve ser obrigatoriamente Empreendedor, Coordenador, Grupo ou Admin',
  })
  novoPapel!: 'Empreendedor' | 'Coordenador' | 'Grupo' | 'Admin';
}