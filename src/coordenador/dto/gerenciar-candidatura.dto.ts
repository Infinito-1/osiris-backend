import { IsInt, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusCandidatura } from '../../candidatura/dto/status.enum';

export class GerenciarCandidaturaDto {
  @ApiProperty({ example: 12, description: 'ID da candidatura' })
  @IsInt()
  candidaturaId!: number;

  @ApiProperty({ example: 'Aceita', description: 'Status da candidatura' })
  @IsNotEmpty()
  @IsEnum(StatusCandidatura)
  status!: StatusCandidatura; // Pendente, Aceita, Recusada
}
