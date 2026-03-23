import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly emailEnabled: boolean;
  private readonly frontendUrl: string;
  private readonly companyName: string;
  private readonly emailUser: string;

  constructor(private readonly configService: ConfigService) {
    this.emailEnabled = this.configService.get<boolean>('EMAIL_ENABLED') ?? false;
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL')!;
    this.companyName = this.configService.get<string>('COMPANY_NAME') || 'Siren';
    this.emailUser = this.configService.get<string>('EMAIL_USER') || '';

    if (this.emailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('EMAIL_HOST'),
        port: this.configService.get<number>('EMAIL_PORT'),
        secure: false,
        auth: {
          user: this.emailUser,
          pass: this.configService.get<string>('EMAIL_PASSWORD'),
        },
      });
    }
  }

  async sendVerificationEmail(
    email: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    if (!this.emailEnabled) {
      this.logger.warn(
        `Email disabled — verification token for ${email}: ${token}`,
      );
      return;
    }

    const html = `
      <h2>Welcome to ${this.companyName}, ${fullName}!</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 4px; font-size: 32px; color: #4F46E5;">${token}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `;

    await this.sendMail(email, `${this.companyName} — Verify your email`, html);
  }

  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    if (!this.emailEnabled) {
      this.logger.warn(
        `Email disabled — password reset token for ${email}: ${token}`,
      );
      return;
    }

    const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${fullName},</p>
      <p>Your password reset code is:</p>
      <h1 style="letter-spacing: 4px; font-size: 32px; color: #4F46E5;">${token}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendMail(email, `${this.companyName} — Password Reset`, html);
  }

  async sendAccountBlockedEmail(
    email: string,
    fullName: string,
  ): Promise<void> {
    if (!this.emailEnabled) {
      this.logger.warn(`Email disabled — blocked notification for ${email}`);
      return;
    }

    const html = `
      <h2>Account Blocked</h2>
      <p>Hello ${fullName},</p>
      <p>Your account has been blocked. Please contact support for more information.</p>
    `;

    await this.sendMail(email, `${this.companyName} — Account Blocked`, html);
  }

  async sendAccountUnblockedEmail(
    email: string,
    fullName: string,
  ): Promise<void> {
    if (!this.emailEnabled) {
      this.logger.warn(`Email disabled — unblocked notification for ${email}`);
      return;
    }

    const html = `
      <h2>Account Reactivated</h2>
      <p>Hello ${fullName},</p>
      <p>Your account has been reactivated. You can now log in again.</p>
    `;

    await this.sendMail(email, `${this.companyName} — Account Reactivated`, html);
  }

  async sendAccountDeletedEmail(
    email: string,
    fullName: string,
  ): Promise<void> {
    if (!this.emailEnabled) {
      this.logger.warn(`Email disabled — deleted notification for ${email}`);
      return;
    }

    const html = `
      <h2>Account Deleted</h2>
      <p>Hello ${fullName},</p>
      <p>Your account has been deleted. If this was not your request, please contact support immediately.</p>
    `;

    await this.sendMail(email, `${this.companyName} — Account Deleted`, html);
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const text = html.replace(/<[^>]*>/g, '');

      await this.transporter.sendMail({
        from: `"${this.companyName}" <${this.emailUser}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${(error as Error).message}`,
      );
    }
  }
}
