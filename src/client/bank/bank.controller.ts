import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BankService } from './bank.service';
import { AddAccountDto } from './dtos/add-account.dto';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';

@Controller('banks')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  async addBankDetails(
    @Body() input: AddAccountDto,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.bankService.newBankDetails(userId, input);
    return new SuccessResponseDto(
      'Account Details Added Successfully',
      response,
    );
  }

  @Put(':id')
  async updateBankDetails(
    @Body() input: UpdateAccountDto,
    @Param('id') id: number,
  ) {
    const response = await this.bankService.updateBankDetails(id, input);
    return new SuccessResponseDto(
      'Account Details updated Successfully',
      response,
    );
  }

  @Get('')
  async fetchBankDetails(@LoggedInUser('id') userId: number) {
    const response = await this.bankService.fetchUserBanks(userId);
    return new SuccessResponseDto(
      'Account Details Retrieved Successfully',
      response,
    );
  }
}
