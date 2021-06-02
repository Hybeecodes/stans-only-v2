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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() input: RegisterDto): Promise<SuccessResponseDto> {
    const response = await this.authService.register(input);
    return new SuccessResponseDto('Registration Successful', response);
  }

  @Post('social')
  async socialLogin(
    @Body() input: SocialLoginDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.socialLogin(input);
    return new SuccessResponseDto('Login Successful', response);
  }

  @Post('email/verify')
  async verifyEmail(
    @Body() input: VerifyEmailDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.verifyEmail(input);
    return new SuccessResponseDto('Email Verification Successful', response);
  }

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

  @Post('login')
  async login(@Body() input: LoginDto): Promise<SuccessResponseDto> {
    const response = await this.authService.login(input);
    return new SuccessResponseDto('Login Successful', response);
  }

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

  @Post('password/reset')
  async resetPassword(
    @Body() input: ResetPasswordDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.authService.resetPassword(input);
    return new SuccessResponseDto('Password Reset Successful', response);
  }
}
