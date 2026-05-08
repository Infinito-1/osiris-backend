import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateDemandaDto {
  @IsOptional()
  @IsString()
  demStrNome?: string;

  @IsOptional()
  @IsString()
  demStrDescricao?: string;

  @IsOptional()
  @IsBoolean()
  demBoolAceitaMudancaTipo?: boolean;

  @IsOptional()
  @IsBoolean()
  demBoolAceitacao?: boolean;

  @IsOptional()
  semIntId?: number;

  @IsOptional()
  empIntId?: number;

  @IsOptional()
  cooIntId?: number;

  @IsOptional()
  tipIntIds?: number[];
}
