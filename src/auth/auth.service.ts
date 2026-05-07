import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/services/usuario.service';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usuarioService: UsuarioService,
  ) {}

  async validateUser(email: string, senha: string): Promise<Usuario | null> {
    const usuario = await this.usuarioService.findByEmail(email);
    if (usuario && await bcrypt.compare(senha, usuario.usuStrSenha)) {
      const { usuStrSenha, ...result } = usuario;
      return result as Usuario;
    }
    return null;
  }

  async login(usuario: Usuario) {
    const payload = { username: usuario.usuStrEmail, sub: usuario.usuIntId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
