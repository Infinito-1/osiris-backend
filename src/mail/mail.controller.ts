import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // TESTE DE ENVIO COM CÓDIGO
  @Get('test')
  async sendTest(@Query('to') to: string) {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // ADICIONADO: 'ADMIN' como entidade para o teste
    await this.mailService.sendConfirmationEmail('ADMIN', to, codigo);

    return {
      message: `Email de teste enviado para ${to}`,
      codigo // útil pra testar no Postman
    };
  }

  // ADICIONADO: 'ADMIN' como entidade para o teste
  @Get('demanda')
  async sendDemanda(
    @Query('to') to: string,
    @Query('nome') nome: string
  ) {
    await this.mailService.sendDemandaAprovadaEmail('ADMIN', to, nome);

    return {
      message: `Email de aprovação enviado para ${to} sobre a demanda ${nome}`
    };
  }
}
