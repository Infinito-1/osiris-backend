import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateCandidaturaDto {
  @IsOptional()
  @IsString()
  canStrStatus?: string;

  @IsOptional()
  @IsBoolean()
  canBoolAprovacao?: boolean;

  @IsOptional()
  cooIntId?: number;

  @IsOptional()
  demIntId?: number;

  @IsOptional()
  gruIntId?: number;
}
