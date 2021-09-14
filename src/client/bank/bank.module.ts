import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountRepository } from '../../repositories/bank-account.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountRepository]), UsersModule],
  controllers: [BankController],
  providers: [BankService],
})
export class BankModule {}
