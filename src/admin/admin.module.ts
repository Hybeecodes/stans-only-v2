import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientUserModule } from './client-user/client-user.module';

@Module({
  imports: [AuthModule, ClientUserModule],
})
export class AdminModule {}
