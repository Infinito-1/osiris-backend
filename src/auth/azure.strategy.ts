import { BearerStrategy } from 'passport-azure-ad';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsuarioService } from '../usuario/services/usuario.service';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AzureStrategy extends PassportStrategy(BearerStrategy, 'azure') {
  constructor(private readonly usuarioService: UsuarioService) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_CLIENT_ID || 'falso-client-id-para-desenvolvimento-local',
      validateIssuer: false, 
      loggingLevel: 'error',
      passReqToCallback: false,
    });
  }

  async validate(payload: any): Promise<Usuario> {
    // A Azure costuma enviar o e-mail no campo preferred_username ou upn
    const email = payload.preferred_username || payload.upn;
    
    if (!email) {
      throw new UnauthorizedException('O token da Microsoft não retornou um e-mail válido.');
    }

    // Busca o usuário correspondente no nosso banco de dados local
    let usuario = await this.usuarioService.findByEmail(email) as Usuario | null;

    // Se o usuário não existir no banco, fazemos o auto-cadastro respeitando a RN-19
    if (!usuario) {
      const emailInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@([a-z0-9-]+\.)?(cps\.sp\.gov\.br|fatec\.sp\.gov\.br)$/i;
      const ehInstitucional = emailInstitucionalRegex.test(email);
      
      // Criamos o payload forçando a tipagem aceita pela entidade base para sumir os erros do compilador
      const dadosNovoUsuario: any = {
        usuStrNome: payload.name || 'Usuário Institucional',
        usuStrEmail: email,
        usuStrSenha: '', // Contas institucionais via OAuth não utilizam ou salvam senha local
        usuStrTipo: ehInstitucional ? 'Grupo' : 'Empreendedor', // RN-19 e RN-17
        usuBoolAtivo: true,
        usuBoolConfirmado: true, // Já que veio autenticado e validado pela própria Microsoft
      };

      usuario = await this.usuarioService.create(dadosNovoUsuario) as Usuario;
    }

    // Forçamos o TypeScript a interpretar o objeto estritamente como a sua Entity Usuario
    const usuarioTipado = usuario as Usuario;

    // Agora o compilador reconhece perfeitamente a propriedade usuBoolAtivo da sua Entity!
    if (!usuarioTipado.usuBoolAtivo) {
      throw new UnauthorizedException('Esta conta está desativada no ecossistema Osiris.');
    }

    return usuarioTipado;
  }
}