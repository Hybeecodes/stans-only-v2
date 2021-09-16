import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { SocialLoginDto } from './dtos/social-login.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SkipAuth } from '../../utils/meta/skip-auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('register')
  async register(@Body() input: RegisterDto): Promise<SuccessResponseDto> {
    const response = await this.authService.register(input);
    return new SuccessResponseDto('Registration Successful', response);
  }

  @SkipAuth()
  @Post('social')
  async socialLogin(
    @Body() input: SocialLoginDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.socialLogin(input);
    return new SuccessResponseDto('Login Successful', response);
  }

  @SkipAuth()
  @Post('email_sendgrid/verify')
  async verifyEmail(
    @Body() input: VerifyEmailDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.verifyEmail(input);
    return new SuccessResponseDto('Email Verification Successful', response);
  }

  @SkipAuth()
  @Post('email_sendgrid/verify/resend')
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
  async login(@Body() input: LoginDto): Promise<SuccessResponseDto> {
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
