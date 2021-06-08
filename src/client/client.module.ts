import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientEventHandlerModule } from '../events/client/handlers/client-event-handler.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, ClientEventHandlerModule, UsersModule],
  providers: [],
  exports: [AuthModule],
})
export class ClientModule {}
