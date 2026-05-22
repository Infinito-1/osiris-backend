import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.office365.com', // Altere para smtp.gmail.com se for usar Google Gmail
        port: 587,
        secure: false,
        auth: {
          user: 'seu_email@outlook.com', 
          pass: 'sua_senha_ou_app_password', 
        },
      },
      defaults: {
        from: '"Osiris" <no-reply@osiris.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}