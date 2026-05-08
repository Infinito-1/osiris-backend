import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateDemandaDto {
  @IsNotEmpty()
  @IsString()
  demStrNome: string;

  @IsNotEmpty()
  @IsString()
  demStrDescricao: string;

  @IsBoolean()
  demBoolAceitaMudancaTipo: boolean;

  @IsBoolean()
  demBoolAceitacao: boolean;

  @IsNotEmpty()
  semIntId: number; // FK para Semestre

  @IsNotEmpty()
  empIntId: number; // FK para Empreendedor

  @IsNotEmpty()
  cooIntId: number; // FK para Coordenador

  @IsNotEmpty()
  tipIntIds: number[]; // IDs de TipoDemanda (muitos-para-muitos)
}
