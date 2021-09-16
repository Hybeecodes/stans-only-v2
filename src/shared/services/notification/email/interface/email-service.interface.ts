import { SendEmailPayload } from './send-email-payload.interface';

export interface EmailService {
  sendMail: (payload: SendEmailPayload) => Promise<void>;
}
