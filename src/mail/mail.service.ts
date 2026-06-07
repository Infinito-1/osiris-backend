import { Injectable } from '@nestjs/common';
import { SMTPClient } from 'emailjs';

@Injectable()
export class MailService {
  private client: SMTPClient;

  constructor() {
    // Configuração utilizando os dados do Mailtrap
    this.client = new SMTPClient({
      user: 'b235f87a208955',          // Seu usuário do Mailtrap
      password: '4f88d37b35d02c', // Sua senha do Mailtrap
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      ssl: false,
      tls: true,
    });
  }

  private async sendMail(to: string, subject: string, text: string) {
    return new Promise((resolve, reject) => {
      this.client.send(
        {
          text,
          from: 'osiris@projeto.com', // Remetente fictício
          to,
          subject,
        },
        (err, message) => {
          if (err) reject(err);
          else resolve(message);
        }
      );
    });
  }

  async sendConfirmationEmail(to: string, codigo: string) {
    return this.sendMail(
      to,
      'Confirme sua conta no Osiris',
      `Olá!

Seu código de confirmação é: ${codigo}

Digite esse código no sistema para ativar sua conta.

Se você não solicitou, ignore este email.`
    );
  }

  async sendResetPasswordEmail(to: string, token: string) {
    return this.sendMail(
      to,
      'Recuperação de senha - Osiris',
      `Clique no link para redefinir sua senha: https://osiris.com/usuarios/resetar-senha/${token}`
    );
  }

  async sendDemandaAprovadaEmail(to: string, nomeDemanda: string) {
    return this.sendMail(
      to,
      'Osíris - Sua demanda foi aprovada!',
      `Sua demanda "${nomeDemanda}" foi aprovada e já está publicada na galeria do Osíris.`
    );
  }

  async sendStatusCandidaturaEmail(to: string, nomeDemanda: string, status: string) {
    return this.sendMail(
      to,
      `Osíris - Atualização de Candidatura: ${status}`,
      `O status da candidatura para a demanda "${nomeDemanda}" foi atualizado para: ${status}.`
    );
  }
}