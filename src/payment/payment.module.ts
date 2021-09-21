import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { FlutterwaveService } from './flutterwave/flutterwave.service';
import { Injectables } from '../shared/constants/injectables.enum';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRepository } from '../repositories/transaction.repository';
import { UsersModule } from '../client/users/users.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletHistoryRepository } from '../repositories/wallet-history.repository';
import { PaymentService } from './payment.service';
import { PaymentProviderFactory } from './factories/payment-provider.factory';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([TransactionRepository, WalletHistoryRepository]),
    UsersModule,
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
  providers: [
    {
      provide: Injectables.PAYMENT_SERVICE,
      useClass: FlutterwaveService,
    },
    PaymentService,
    PaymentProviderFactory,
    FlutterwaveService,
  ],
})
export class PaymentModule {}
