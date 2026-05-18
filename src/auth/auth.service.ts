import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/services/usuario.service';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const usuario = await this.usuarioService.findByEmail(email);
    if (usuario && await bcrypt.compare(senha, usuario.usuStrSenha)) {
      const { usuStrSenha, ...result } = usuario;
      return result;
    }
    return null;
  }

  async login(usuario: any) {
    const payload = {
      username: usuario.usuStrEmail,
      sub: usuario.usuIntId,
      role: usuario.usuStrTipo,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}