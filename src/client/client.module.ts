import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientEventHandlerModule } from '../events/client/handlers/client-event-handler.module';

@Module({
  imports: [AuthModule, ClientEventHandlerModule],
  providers: [],
  exports: [AuthModule],
})
export class ClientModule {}
