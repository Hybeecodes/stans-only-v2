import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountRepository } from '../../repositories/bank-account.repository';
import { AddAccountDto } from './dtos/add-account.dto';
import { UsersService } from '../users/users.service';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { BankDto } from './dtos/bank.dto';
import { User } from '../../entities/user.entity';

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
    const { bankCode, bankName, accountName, accountNumber } = input;
    // check if bank details exists
    const exists = await this.bankAccountRepository.findOne({
      where: { bankCode, bankName, accountNumber, isDeleted: false },
    });
    if (exists) {
      throw new HttpException(
        'Bank Account already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
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
      const banks = await this.bankAccountRepository.find({
        user,
        isDeleted: false,
      });
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

  async getBankById(user: User, bankId: number): Promise<BankDto> {
    const bank = await this.bankAccountRepository.findOne({
      user,
      id: bankId,
      isDeleted: false,
    });
    if (!bank) {
      throw new HttpException('Bank Account not found', HttpStatus.NOT_FOUND);
    }
    return new BankDto(bank);
  }

  async deleteBankAccount(bankId: number): Promise<void> {
    const bank = await this.bankAccountRepository.findOne({
      id: bankId,
      isDeleted: false,
    });
    if (!bank) {
      throw new HttpException('Bank Account not found', HttpStatus.NOT_FOUND);
    }
    bank.isDeleted = true;
    await this.bankAccountRepository.save(bank);
  }
}
