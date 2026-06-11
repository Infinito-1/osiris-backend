import { Injectable } from '@nestjs/common';
import { SMTPClient } from 'emailjs';

// Definimos o tipo como uma variável para reutilizar e facilitar manutenções futuras
type Entidade = 'GRUPO' | 'EMPREENDEDOR' | 'COORDENADOR' | 'ADMIN' | 'USUARIO';

@Injectable()
export class MailService {

  // Factory que define qual configuração usar baseado no tipo de usuário/entidade
  private getClient(entidade: Entidade): SMTPClient {
    const isGrupo = entidade === 'GRUPO';

    return new SMTPClient({
      user: isGrupo ? process.env.OUTLOOK_USER! : process.env.GMAIL_USER!,
      password: isGrupo ? process.env.OUTLOOK_PASS! : process.env.GMAIL_PASS!,
      host: isGrupo ? 'smtp.office365.com' : 'smtp.gmail.com',
      port: isGrupo ? 587 : 465,
      ssl: !isGrupo, // Outlook (false), Gmail (true)
      tls: isGrupo,  // Outlook (true), Gmail (false)
    });
  }

  // Método central de envio que agora aceita a entidade 'USUARIO'
  private async sendMail(entidade: Entidade, to: string, subject: string, text: string) {
    const client = this.getClient(entidade);
    
    return new Promise((resolve, reject) => {
      client.send(
        {
          text,
          from: entidade === 'GRUPO' ? process.env.OUTLOOK_USER! : process.env.GMAIL_USER!,
          to,
          subject,
        },
        (err, message) => {
          if (err) {
            console.error(`Erro ao enviar e-mail via ${entidade}:`, err);
            reject(err);
          } else {
            resolve(message);
          }
        }
      );
    });
  }

  // --- Métodos adaptados para aceitar 'USUARIO' ---

  async sendConfirmationEmail(entidade: Entidade, to: string, codigo: string) {
    return this.sendMail(
      entidade,
      to,
      'Confirme sua conta no Osiris',
      `Olá!\n\nSeu código de confirmação é: ${codigo}\n\nDigite esse código no sistema para ativar sua conta.\n\nSe você não solicitou, ignore este email.`
    );
  }

  async sendResetPasswordEmail(entidade: Entidade, to: string, token: string) {
    return this.sendMail(
      entidade,
      to,
      'Recuperação de senha - Osiris',
      `Clique no link para redefinir sua senha: https://osiris.com/usuarios/resetar-senha/${token}`
    );
  }

  async sendDemandaAprovadaEmail(entidade: Entidade, to: string, nomeDemanda: string) {
    return this.sendMail(
      entidade,
      to,
      'Osíris - Sua demanda foi aprovada!',
      `Sua demanda "${nomeDemanda}" foi aprovada e já está publicada na galeria do Osíris.`
    );
  }

  async sendStatusCandidaturaEmail(entidade: Entidade, to: string, nomeDemanda: string, status: string) {
    return this.sendMail(
      entidade,
      to,
      `Osíris - Atualização de Candidatura: ${status}`,
      `O status da candidatura para a demanda "${nomeDemanda}" foi atualizado para: ${status}.`
    );
  }
}