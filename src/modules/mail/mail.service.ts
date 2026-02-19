import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  async sendResetPasswordEmail(email: string, resetLink: string) {
    // ✅ Transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // TLS uses false for 587
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    // ✅ Send Email
    await transporter.sendMail({
      from: `"Ecommerce Support" <${this.configService.get('MAIL_USER')}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click below link to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return {
      message: 'Reset password email sent successfully',
    };
  }
}
