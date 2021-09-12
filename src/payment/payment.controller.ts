import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Injectables } from '../shared/constants/injectables.enum';
import { IPaymentService } from './interfaces/payment.service.interface';
import { VerifyBvnDto } from './dtos/verify-bvn.dto';
import { SuccessResponseDto } from '../shared/success-response.dto';
import { FetchBanksQueryDto } from './dtos/fetch-banks-query.dto';
import { UserAuthGuard } from '../utils/guards/user-auth.guard';
import { LoggedInUser } from '../utils/decorators/logged-in-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(
    @Inject(Injectables.PAYMENT_SERVICE)
    private readonly paymentService: IPaymentService,
  ) {}

  @Get('bvn/:bvn/verify')
  async verifyBvn(@Param('bvn') bvn: string) {
    const payload = new VerifyBvnDto(parseInt(bvn));
    const response = await this.paymentService.verifyBvn(payload);
    return new SuccessResponseDto('Bvn Verification Successfully', response);
  }

  @UseGuards(UserAuthGuard)
  @Get('transactions/:transactionReference/verify')
  async verifyPayment(
    @Param() payload: any,
    @LoggedInUser('id') userId: number,
  ) {
    const { message, data } = await this.paymentService.verifyPayment(
      payload,
      userId,
    );
    return new SuccessResponseDto(message, data);
  }

  @Get('banks')
  async fetchBanks(@Query() payload: FetchBanksQueryDto) {
    const { message, data } = await this.paymentService.getBanks(payload);
    return new SuccessResponseDto(message, data);
  }
}
