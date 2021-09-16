import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import SESEmailClient from 'ses-email-client';

import { EmailService } from '../interface/email-service.interface';
import { SendEmailPayload } from '../interface/send-email-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SesService implements EmailService {
  private readonly logger: Logger;

  private readonly SES: AWS.SES;
  private readonly sesClient: SESEmailClient;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(SesService.name);
    this.SES = new AWS.SES({
      region: this.configService.get('AWS_REGION'),
      apiVersion: '2010-12-01',
      accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
    });

    this.sesClient = new SESEmailClient({
      region: this.configService.get('AWS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      templateLanguage: 'handlebars', // 'mjml', 'ejs'
      production: false, // or process.env.NODE_ENV = production is as setting to true
      tmpltCacheSize: 50, // template cache size default = 100
      attCacheSize: 50, // attachment cache size default = 100
    });
  }

  async sendMail(sendEmailPayload: SendEmailPayload): Promise<void> {
    try {
      const { MessageId } = await this.sesClient.send({
        to: sendEmailPayload.recipients.toString(),
        from: 'noreply@stansonly.com',
        subject: sendEmailPayload.subject,
        template: sendEmailPayload.template,
        data: sendEmailPayload.templateData,
      });
      this.logger.log(`Email Send Successfully ===> ${MessageId}`);
    } catch (error) {
      this.logger.error(`Send Mail Failed: ${JSON.stringify(error)}`);
    }
  }
}
