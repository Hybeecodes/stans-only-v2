import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientEventHandlerModule } from '../events/client/handlers/client-event-handler.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SearchModule } from './search/search.module';
import { APP_GUARD } from '@nestjs/core';
import { UserAuthGuard } from '../utils/guards/user-auth.guard';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    AuthModule,
    ClientEventHandlerModule,
    UsersModule,
    PostsModule,
    SubscriptionModule,
    SearchModule,
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
    SuggestionsModule,
    BookmarksModule,
    NotificationsModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
  ],
  exports: [AuthModule],
})
export class ClientModule {}
