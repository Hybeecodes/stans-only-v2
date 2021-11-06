import { Module } from '@nestjs/common';
import { ClientUserService } from './client-user.service';
import { ClientUserController } from './client-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { AuthModule } from '../../client/auth/auth.module';
import { PaymentModule } from '../../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    AuthModule,
    PaymentModule,
  ],
  providers: [ClientUserService],
  controllers: [ClientUserController],
  exports: [ClientUserService],
})
export class ClientUserModule {}
