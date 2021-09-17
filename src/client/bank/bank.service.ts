import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountRepository } from '../../repositories/bank-account.repository';
import { AddAccountDto } from './dtos/add-account.dto';
import { UsersService } from '../users/users.service';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { BankDto } from './dtos/bank.dto';

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

  async newBankDetails(userId: number, input: AddAccountDto): Promise<void> {
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

  async updateBankDetails(
    accountId: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<void> {
    const account = await this.bankAccountRepository.findOne({
      id: accountId,
      isDeleted: false,
    });
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    try {
      const { bankCode, bankName, accountName, accountNumber } =
        updateAccountDto;
      account.bankCode = bankCode;
      account.bankName = bankName;
      account.accountNumber = accountNumber;
      account.accountName = accountName;
      await this.bankAccountRepository.save(account);
    } catch (e) {
      this.logger.error(
        `Unable to Update Bank Details: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to update Bank Details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchUserBanks(userId: number): Promise<BankDto[]> {
    const user = await this.usersService.findUserById(userId);
    try {
      const banks = await this.bankAccountRepository.find({ user });
      return banks.map((b) => {
        return new BankDto(b);
      });
    } catch (e) {
      this.logger.error(
        `Unable to Fetch Bank Details: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to fetch Bank Details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
