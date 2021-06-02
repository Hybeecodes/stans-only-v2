import { Module } from '@nestjs/common';
import { SendGridModule } from '@ntegral/nestjs-sendgrid';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    SendGridModule.forRootAsync({
      imports: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        apiKey: config.get<string>('SENDGRID_API_KEY'),
      }),
      inject: [ConfigService],
    }),
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
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
