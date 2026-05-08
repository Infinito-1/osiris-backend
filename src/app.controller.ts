import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  status() {
    return {
      message: 'API Osiris rodando com sucesso 🚀',
      timestamp: new Date().toISOString(),
    };
  }
}
