import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { FlutterwaveService } from './flutterwave/flutterwave.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRepository } from '../repositories/transaction.repository';
import { UsersModule } from '../client/users/users.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletHistoryRepository } from '../repositories/wallet-history.repository';
import { PaymentService } from './payment.service';
import { PaymentProviderFactory } from './factories/payment-provider.factory';
import { BankModule } from '../client/bank/bank.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([TransactionRepository, WalletHistoryRepository]),
    forwardRef(() => UsersModule),
    BankModule,
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
  controllers: [PaymentController],
  providers: [PaymentService, PaymentProviderFactory, FlutterwaveService],
  exports: [PaymentService],
})
export class PaymentModule {}
