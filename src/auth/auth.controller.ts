import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const usuario = await this.authService.validateUser(body.email, body.senha);
    if (!usuario) {
      return { message: 'Credenciais inválidas' };
    }
    return this.authService.login(usuario);
  }
}
