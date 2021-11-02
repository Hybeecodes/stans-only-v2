import { Body, Controller, Post } from '@nestjs/common';

import { SkipAuth } from '../../utils/meta/skip-auth';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { VerifyEmailDto } from '../../client/auth/dtos/verify-email.dto';
import { ResendVerificationDto } from '../../client/auth/dtos/resend-verification.dto';
import { ForgotPasswordDto } from '../../client/auth/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../client/auth/dtos/reset-password.dto';
import { UpdatePasswordDto } from '../../client/auth/dtos/update-password.dto';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { AuthService } from './auth.service';
import { InviteUserDto } from './dtos/invite-user.dto';
import { AdminLoginDto } from './dtos/login.dto';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('invite')
  async register(@Body() input: InviteUserDto): Promise<SuccessResponseDto> {
    const response = await this.authService.inviteAdminUser(input);
    return new SuccessResponseDto('Registration Successful', response);
  }

  @SkipAuth()
  @Post('email/verify')
  async verifyEmail(
    @Body() input: VerifyEmailDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.verifyEmail(input);
    return new SuccessResponseDto('Email Verification Successful', response);
  }

  @SkipAuth()
  @Post('email/verify/resend')
  async resendEmailVerification(
    @Body() input: ResendVerificationDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.resendEmailVerification(input);
    return new SuccessResponseDto(
      'Email Verification Resent Successful',
      response,
    );
  }

  @SkipAuth()
  @Post('login')
  async login(@Body() input: AdminLoginDto): Promise<SuccessResponseDto> {
    const response = await this.authService.login(input);
    return new SuccessResponseDto('Login Successful', response);
  }

  @SkipAuth()
  @Post('password/forgot')
  async forgotPassword(
    @Body() input: ForgotPasswordDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.forgotPassword(input);
    return new SuccessResponseDto(
      'Password Reset Request Sent Successful',
      response,
    );
  }

  @SkipAuth()
  @Post('password/reset')
  async resetPassword(
    @Body() input: ResetPasswordDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.resetPassword(input);
    return new SuccessResponseDto('Password Reset Successful', response);
  }

  @Post('password/change')
  async changePassword(
    @Body() input: UpdatePasswordDto,
    @LoggedInUser('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.updatePassword(userId, input);
    return new SuccessResponseDto('Password Updated Successful', response);
  }
}
