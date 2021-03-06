export interface SendEmailPayload {
  subject: string;
  recipients: string[];
  message?: string;
  template?: any;
  templateData?: Record<string, unknown>;
}
