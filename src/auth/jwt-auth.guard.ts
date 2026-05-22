import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Injetamos o Reflector do NestJS para conseguir ler os metadados das rotas
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verifica se a rota específica ou a Controller possui a flag @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se for público, retorna true e libera o acesso sem validar token!
    if (isPublic) {
      return true;
    }

    // Se NÃO for público, segue o fluxo normal do Passport (exige o token JWT)
    return super.canActivate(context);
  }
}