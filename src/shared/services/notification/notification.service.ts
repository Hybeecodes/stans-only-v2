import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Injectables } from '../../constants/injectables.enum';
import { EmailService } from './email/interface/email-service.interface';

@Injectable()
export class NotificationService {
  private readonly logger: Logger;
  private readonly appBaseUrl: string;
  constructor(
    @Inject(Injectables.EMAIL_SERVICE)
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(NotificationService.name);
    this.appBaseUrl = this.configService.get('APP_BASE_URL');
  }
  private static async getTemplate(templateName) {
    const data = fs.readFileSync(`templates/${templateName}.hbs`).toString();
    return handlebars.compile(data);
  }

  async sendNewUserEmail(user: User): Promise<void> {
    try {
      // read the handle templates files
      const template = await NotificationService.getTemplate('newUser');
      // send the email_sendgrid with
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
        template,
      });
      // await this.sendGridService.send({
      //   to: email,
      //   html: template(),
      //   from: { name: 'StansOnly', email: 'support@stansonly.com' },
      //   subject: '',
      // });
      this.logger.log(`Welcome Email Sent to ${email}`);
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  async sendForgotPasswordEmail(user: User): Promise<void> {
    try {
      const template = await NotificationService.getTemplate('forgotpassword');
      const { email, firstName, resetToken } = user;
      const resetHash = this.jwtService.sign({
        email,
        resetToken,
      });
      console.log(resetHash);
      // const url = `${this.appBaseUrl}/resetpassword/${resetHash}`;
      // await this.sendGridService.send({
      //   to: email,
      //   html: template({
      //     name: `${firstName}`,
      //     logoUrl:
      //       'https://res.cloudinary.com/stansonlycloud/image/upload/v1600877280/stansonly/Stansoly_new_blue_2x_1_pxgmhr.png',
      //     url,
      //   }),
      //   text: 'Click the button below to reset your password',
      //   from: { name: 'StansOnly', email: 'support@stansonly.com' },
      //   subject: 'Password Reset Request',
      // });
      this.logger.log(`Reset Password Email Sent to ${email}`);
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
