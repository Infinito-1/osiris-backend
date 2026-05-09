import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGrupoDto {
  @ApiProperty({ example: 'Grupo Alpha', description: 'Nome do grupo' })
  @IsNotEmpty()
  @IsString()
  gruStrNome: string;

  @ApiProperty({ example: 'Grupo de desenvolvimento de software', description: 'Descrição do grupo' })
  @IsNotEmpty()
  @IsString()
  gruStrDescricao: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome do líder do grupo' })
  @IsNotEmpty()
  @IsString()
  gruIntLider: string;

  @ApiProperty({ example: 'RA123456', description: 'Código RA do líder' })
  @IsNotEmpty()
  @IsString()
  gruChaRa: string;

  @ApiProperty({ example: 5, description: 'Tamanho do grupo' })
  @IsNotEmpty()
  @IsNumber()
  gruIntTamanho: number;

  @ApiProperty({ example: 'Maria, Pedro, Ana', description: 'Lista de membros do grupo', required: false })
  @IsOptional()
  @IsString()
  gruStrMembros?: string;

  @ApiProperty({ example: 10, description: 'ID do usuário vinculado ao grupo' })
  @IsNotEmpty()
  usuIntId: number;
}
