import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateCandidaturaDto {
  @IsNotEmpty()
  @IsString()
  canStrStatus: string;

  @IsBoolean()
  canBoolAprovacao: boolean;

  @IsNotEmpty()
  cooIntId: number; // FK para Coordenador

  @IsNotEmpty()
  demIntId: number; // FK para Demanda

  @IsNotEmpty()
  gruIntId: number; // FK para Grupo
}
