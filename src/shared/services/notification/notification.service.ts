import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Injectables } from '../../constants/injectables.enum';
import { EmailService } from './email/interface/email-service.interface';

@Injectable()
export class NotificationService {
  private readonly logger: Logger;
  private readonly appBaseUrl: string;
  private readonly adminAppBaseUrl: string;

  constructor(
    @Inject(Injectables.EMAIL_SERVICE)
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(NotificationService.name);
    this.appBaseUrl = this.configService.get('APP_BASE_URL');
    this.adminAppBaseUrl = this.configService.get('ADMIN_APP_BASE_URL');
  }

  async sendNewUserEmail(user: User): Promise<void> {
    try {
      // send the email with
      const { email, firstName } = user;
      const token = this.jwtService.sign({ email });
      console.log(token);
      const url = `${this.appBaseUrl}/email-verification/${token}`;
      await this.emailService.sendMail({
        recipients: [email],
        subject: 'Welcome To StansOnly - Complete account setup',
        templateData: {
          name: `${firstName}`,
          logoUrl:
            'https://res.cloudinary.com/stansonlycloud/image/upload/v1600877280/stansonly/Stansoly_new_blue_2x_1_pxgmhr.png',
          url,
        },
        template: 'newUser',
      });
      this.logger.log(`Welcome Email Sent to ${email}`);
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  async sendNewAdminUserEmail(user: User): Promise<void> {
    try {
      // send the email with
      const { email, firstName } = user;
      const token = this.jwtService.sign({ email });
      console.log(token);
      const url = `${this.adminAppBaseUrl}/email/verify/${token}`;
      await this.emailService.sendMail({
        recipients: [email],
        subject: 'Welcome To StansOnly - Complete account setup',
        templateData: {
          name: `${firstName}`,
          logoUrl:
            'https://res.cloudinary.com/stansonlycloud/image/upload/v1600877280/stansonly/Stansoly_new_blue_2x_1_pxgmhr.png',
          url,
        },
        template: 'newUser',
      });
      this.logger.log(`Welcome Email Sent to ${email}`);
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  async sendForgotPasswordEmail(user: User): Promise<void> {
    try {
      const { email, firstName, resetToken } = user;
      const resetHash = this.jwtService.sign({
        email,
        resetToken,
      });
      console.log(resetHash);
      const url = `${this.appBaseUrl}/resetpassword/${resetHash}`;

      await this.emailService.sendMail({
        recipients: [email],
        subject: 'StansOnly - Password Reset Request',
        templateData: {
          name: `${firstName}`,
          logoUrl:
            'https://res.cloudinary.com/stansonlycloud/image/upload/v1600877280/stansonly/Stansoly_new_blue_2x_1_pxgmhr.png',
          url,
        },
        template: 'forgotpassword',
      });
      this.logger.log(`Reset Password Email Sent to ${email}`);
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
