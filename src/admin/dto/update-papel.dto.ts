import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePapelDto {
  @ApiProperty({ example: 'Coordenador', enum: ['Empreendedor', 'Coordenador', 'Grupo'] })
  @IsNotEmpty()
  @IsEnum(['Empreendedor', 'Coordenador', 'Grupo'], {
    message: 'O papel deve ser obrigatoriamente Empreendedor, Coordenador ou Grupo',
  })
  novoPapel: 'Empreendedor' | 'Coordenador' | 'Grupo';
}