import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirme sua conta no Osiris',
      text: `Olá! Obrigado por se cadastrar. Clique no link para confirmar e ativar sua conta: https://osiris.com/usuarios/confirmar/${token}`,
    });
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperação de senha - Osiris',
      text: `Você solicitou uma alteração de senha. Clique no link para redefinir sua senha: https://osiris.com/usuarios/resetar-senha/${token}`,
    });
  }

  // RN-15 & RF-20: Notificação enviada ao Empreendedor quando sua Demanda é aprovada
  async sendDemandaAprovadaEmail(email: string, nomeDemanda: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Osíris - Sua demanda foi aprovada!',
      text: `Olá! Temos boas notícias.\n\nSua demanda "${nomeDemanda}" foi classificada e aprovada pelo coordenador da instituição. Ela já está publicada na galeria do ecossistema Osíris e aberta para receber candidaturas de grupos de estudantes.\n\nAcompanhe o progresso pelo seu painel.`,
    });
  }

  // RN-15 & RF-20: Notificação enviada ao Líder do Grupo sobre a candidatura
  async sendStatusCandidaturaEmail(email: string, nomeDemanda: string, status: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `Osíris - Atualização de Candidatura: ${status}`,
      text: `Olá!\n\nO coordenador responsável revisou a candidatura do seu grupo para a demanda "${nomeDemanda}".\n\nO status atual da sua intenção de projeto foi atualizado para: ${status}.\n\nCaso tenha sido "Aceita", verifique as diretrizes no painel do grupo para iniciar o alinhamento com o empreendedor.`,
    });
  }
}