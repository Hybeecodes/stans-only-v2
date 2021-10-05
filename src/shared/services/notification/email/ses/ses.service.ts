import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

import { EmailService } from '../interface/email-service.interface';
import { SendEmailPayload } from '../interface/send-email-payload.interface';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import Handlebars from 'handlebars';

@Injectable()
export class SesService implements EmailService {
  private readonly logger: Logger;

  private readonly SES: AWS.SES;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(SesService.name);
    this.SES = new AWS.SES({
      region: this.configService.get('AWS_REGION'),
      apiVersion: '2010-12-01',
      accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
    });
  }

  generateBody(
    templateFileName: string,
    templateData: Record<string, unknown>,
  ): string {
    try {
      const templateSource = fs
        .readFileSync(`templates/${templateFileName}.hbs`)
        .toString();
      const template = Handlebars.compile(templateSource);
      return template(templateData);
    } catch (e) {
      console.log(e);
    }
  }

  async sendMail(sendEmailPayload: SendEmailPayload): Promise<void> {
    try {
      const { template, templateData, message, recipients, subject } =
        sendEmailPayload;
      const data =
        template && templateData
          ? this.generateBody(template, templateData)
          : message;
      const { MessageId } = await this.SES.sendEmail({
        Destination: {
          ToAddresses: recipients,
        },
        Message: {
          /* required */
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: data,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: 'noreply@stansonly.com' /* required */,
      }).promise();
      this.logger.log(`Email Send Successfully ===> ${MessageId}`);
    } catch (error) {
      this.logger.error(`Send Mail Failed: ${JSON.stringify(error)}`);
    }
  }
}
