import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; senha: string }) {
    const usuario = await this.authService.validateUser(body.email, body.senha);
    if (!usuario) {
      return { message: 'Credenciais inválidas' };
    }
    return this.authService.login(usuario);
  }
}
