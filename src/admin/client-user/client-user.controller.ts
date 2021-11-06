import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ClientUserService } from './client-user.service';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { GetAllUsersQueryDto } from './dtos/get-all-users-query.dto';
import { PaymentService } from '../../payment/payment.service';
import { GetWalletHistoryQueryDto } from '../../payment/dtos/get-wallet-history-query.dto';

@Controller('admin/client-users')
export class ClientUserController {
  constructor(
    private readonly userService: ClientUserService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get()
  async getAllUsers(
    @Query() query: GetAllUsersQueryDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.userService.getAllUsers(query);
    return new SuccessResponseDto('Users retrieved successfully', response);
  }

  @Get(':id')
  async getUserInfo(@Param('id') userId: number): Promise<SuccessResponseDto> {
    const response = await this.userService.getUserInfo(userId);
    return new SuccessResponseDto(
      'User information retrieved successfully',
      response,
    );
  }

  @Get(':id/transaction/history')
  async getTransactionHistory(
    @Param('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.userService.getUserInfo(userId);
    return new SuccessResponseDto(
      'User information retrieved successfully',
      response,
    );
  }

  @Post(':id/suspend')
  async suspendUser(@Param('id') userId: number): Promise<SuccessResponseDto> {
    const response = await this.userService.suspendUser(userId);
    return new SuccessResponseDto('User suspended successfully', response);
  }

  @Post(':id/unsuspend')
  async unSuspendUser(
    @Param('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.userService.unSuspendUser(userId);
    return new SuccessResponseDto('User unSuspended successfully', response);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') userId: number): Promise<SuccessResponseDto> {
    const response = await this.userService.deactivateUser(userId);
    return new SuccessResponseDto('User deactivate successfully', response);
  }

  @Post(':id/activate')
  async activateUser(@Param('id') userId: number): Promise<SuccessResponseDto> {
    const response = await this.userService.activateUser(userId);
    return new SuccessResponseDto('User activated successfully', response);
  }

  @Post(':id/password/reset')
  async initiatePasswordReset(
    @Param('id') userId: number,
    @Query() query: GetWalletHistoryQueryDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.paymentService.getWalletTransactionHistory(
      userId,
      query,
    );
    return new SuccessResponseDto(
      'User transaction history retrieved successfully',
      response,
    );
  }
}
