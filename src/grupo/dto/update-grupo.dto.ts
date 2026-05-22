import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGrupoDto {
  @IsOptional()
  @IsString()
  gruStrNome?: string;

  @IsOptional()
  @IsString()
  gruStrDescricao?: string;

  @IsOptional()
  @IsString()
  gruChaRa?: string;

  @IsOptional()
  @IsNumber()
  gruIntTamanho?: number;

  @IsOptional()
  @IsString()
  gruStrMembros?: string;

  @IsOptional()
  @IsString()
  gruStrPortfolio?: string;

  @IsOptional()
  @IsBoolean()
  gruBoolAtivo?: boolean;

  @IsOptional()
  @IsNumber()
  usuIntId?: number;

  @IsOptional()
  @IsNumber()
  semIntId?: number;
}