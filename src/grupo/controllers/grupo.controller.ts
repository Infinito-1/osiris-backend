import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../entities/grupo.entity';

@Controller('/grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Grupo[]> {
    //importar
    return this.grupoService.findAll();
  }
}
