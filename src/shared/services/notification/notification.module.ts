import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { Injectables } from '../../constants/injectables.enum';
import { MailjetService } from '../notifications/email/mailjet/mailjet.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        // "jsonwebtoken" option to sign
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  providers: [
    NotificationService,
    { provide: Injectables.EMAIL_SERVICE, useClass: MailjetService },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
