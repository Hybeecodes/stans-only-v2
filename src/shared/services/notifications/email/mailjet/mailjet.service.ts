import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../../notification/email/interface/email-service.interface';
import { SendEmailPayload } from '../../../notification/email/interface/send-email-payload.interface';
import * as fs from 'fs';
import * as Mailjet from 'node-mailjet';
import Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailjetService implements EmailService {
  private readonly logger: Logger;
  private readonly apiKey: string;
  private readonly secretKey: string;
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(this.constructor.name);
    this.apiKey = this.configService.get('MAILJET_API_KEY');
    this.secretKey = this.configService.get('MAILJET_SECRET_KEY');
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

  sendMail(sendEmailPayload: SendEmailPayload): Promise<void> {
    const { template, templateData, message, recipients, subject } =
      sendEmailPayload;
    const data =
      template && templateData
        ? this.generateBody(template, templateData)
        : message;
    const mailjet = Mailjet.connect(this.apiKey, this.secretKey);
    const To: { Email: string; Name: string }[] = [];
    recipients.length &&
      recipients.forEach((r) => {
        To.push({ Email: r, Name: '' });
      });
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'noreply@stansonly.com',
            Name: 'StansOnly',
          },
          To,
          Subject: subject,
          TextPart: '',
          HTMLPart: data,
          CustomID: 'AppGettingStartedTest',
        },
      ],
    });
    request
      .then((result) => {
        console.log('Email Sent');
        console.log(result.body);
      })
      .catch((err) => {
        console.log('Email Failed', err);
        console.log(err.statusCode);
      });
    return Promise.resolve(undefined);
  }
}
