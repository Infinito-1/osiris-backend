import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCoordenadorDto {
  @IsNotEmpty()
  @IsString()
  cooStrCurso: string;

  @IsNotEmpty()
  usuIntId: number; // FK para Usuario
}
