import { IsString, IsOptional } from 'class-validator';

export class UpdateCoordenadorDto {
  @IsOptional()
  @IsString()
  cooStrCurso?: string;

  @IsOptional()
  usuIntId?: number;
}
