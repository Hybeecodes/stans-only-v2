import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SuccessResponseDto } from '../shared/success-response.dto';
import { FetchBanksQueryDto } from './dtos/fetch-banks-query.dto';
import { UserAuthGuard } from '../utils/guards/user-auth.guard';
import { LoggedInUser } from '../utils/decorators/logged-in-user.decorator';
import { ResolveAccountDto } from './dtos/resolve-account.dto';
import { CompleteTopUpTransactionDto } from './dtos/complete-top-up-transaction.dto';
import { PaymentService } from './payment.service';
import { InitiateTopUpTransactionDto } from './dtos/initiate-top-up-transaction.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @Get('bvn/:bvn/verify')
  // async verifyBvn(@Param('bvn') bvn: string) {
  //   const payload = new VerifyBvnDto(parseInt(bvn));
  //   const response = await this.paymentProvider.verifyBvn(payload);
  //   return new SuccessResponseDto('Bvn Verification Successful', response);
  // }

  @Post('account/resolve')
  async resolveAccount(@Body() payload: ResolveAccountDto) {
    const response = await this.paymentService.resolveAccount(payload);
    return new SuccessResponseDto('Account Resolved Successfully', response);
  }

  @UseGuards(UserAuthGuard)
  @Post('wallet/top-up/complete')
  async verifyPayment(
    @Body() payload: CompleteTopUpTransactionDto,
    @LoggedInUser('id') userId: number,
  ) {
    const { message } = await this.paymentService.completeTopUpTransaction(
      payload,
      userId,
    );
    return new SuccessResponseDto(message);
  }

  @UseGuards(UserAuthGuard)
  @Post('wallet/top-up/initiate')
  async initiateTopUp(
    @Body() payload: InitiateTopUpTransactionDto,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.paymentService.initiateTopUpTransaction(
      payload,
      userId,
    );
    return new SuccessResponseDto('Top up Initiation Successful', response);
  }

  @Get('banks')
  async fetchBanks(@Query() payload: FetchBanksQueryDto) {
    const { message, data } = await this.paymentService.fetchBanks(payload);
    return new SuccessResponseDto(message, data);
  }

  @Get('complete-transfer')
  async completeTransfer(@Body() payload: any) {
    console.log(payload);
  }
}
