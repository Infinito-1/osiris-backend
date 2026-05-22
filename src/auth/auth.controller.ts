import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AzureAuthGuard } from './azure-auth.guard';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Autenticação local efetuada com sucesso. Retorna Token JWT.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() body: LoginDto) {
    const usuario = await this.authService.validateUser(body.email, body.senha);
    if (!usuario) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.login(usuario);
  }

  @UseGuards(AzureAuthGuard)
  @Post('microsoft')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Autenticação via Microsoft OAuth2 realizada com sucesso (RNF-06).' })
  @ApiResponse({ status: 401, description: 'Token institucional inválido ou expirado.' })
  async microsoftLogin(@Req() req: any) {
    // req.user agora vem completo contendo a entidade Usuario validada pelo banco de dados local
    return this.authService.login(req.user);
  }
}