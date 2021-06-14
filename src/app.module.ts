import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './shared/services/notification/email/email.service';
import { NotificationModule } from './shared/services/notification/notification.module';
import { TypeOrmOptionsService } from './typeorm/typeorm-options.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './utils/logging.interceptor';
import { ClientModule } from './client/client.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { HttpErrorFilter } from './shared/http-error-filter';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOptionsService,
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
    NotificationModule,
    ClientModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
export class AppModule {}
