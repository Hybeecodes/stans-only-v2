import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionRepository } from '../../repositories/subscription.repository';
import { UsersModule } from '../users/users.module';
import { WalletHistoryRepository } from '../../repositories/wallet-history.repository';
import { WalletLedgerRepository } from '../../repositories/wallet-ledger.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionRepository,
      WalletHistoryRepository,
      WalletLedgerRepository,
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
