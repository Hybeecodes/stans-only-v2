import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientEventHandlerModule } from '../events/client/handlers/client-event-handler.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    AuthModule,
    ClientEventHandlerModule,
    UsersModule,
    PostsModule,
    SubscriptionModule,
    SearchModule,
  ],
  providers: [],
  exports: [AuthModule],
})
export class ClientModule {}
