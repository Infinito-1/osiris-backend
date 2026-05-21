import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AzureAuthGuard } from './azure-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login local (email + senha)
  @Post('login')
  async login(@Body() body: LoginDto) {
    const usuario = await this.authService.validateUser(body.email, body.senha);
    if (!usuario) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.login(usuario);
  }

  // Login Microsoft OAuth2
  @UseGuards(AzureAuthGuard)
  @Post('microsoft')
  async microsoftLogin(@Req() req) {
    // req.user vem do AzureStrategy.validate()
    return this.authService.login(req.user);
  }
}
