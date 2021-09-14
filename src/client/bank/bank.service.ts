import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountRepository } from '../../repositories/bank-account.repository';
import { AddAccountDto } from './dtos/add-account.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class BankService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(BankAccountRepository)
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly usersService: UsersService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async newBankAccount(userId: number, input: AddAccountDto) {
    const user = await this.usersService.findUserById(userId);
    try {
      const { bankCode, bankName, accountName, accountNumber } = input;
      const account = await this.bankAccountRepository.create({
        bankCode,
        bankName,
        accountName,
        accountNumber,
        user,
      });
      await this.bankAccountRepository.save(account);
    } catch (e) {
      this.logger.error(
        `Unable to Add Bank Details: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Add Bank Details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
