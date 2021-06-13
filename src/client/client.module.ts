import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientEventHandlerModule } from '../events/client/handlers/client-event-handler.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [AuthModule, ClientEventHandlerModule, UsersModule, PostsModule],
  providers: [],
  exports: [AuthModule],
})
export class ClientModule {}
