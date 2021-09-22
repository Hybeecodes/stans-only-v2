import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { RegisterDto } from './dtos/register.dto';
import { ErrorMessages } from '../../shared/constants/error-messages.enum';
import { UserDto, UserLoginResponse } from '../../entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../../events/client/events.enum';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { JwtService } from '@nestjs/jwt';
import { StatusType } from '../../shared/constants/status-type.enum';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { nanoid } from 'nanoid';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { comparePassword, hashPassword } from '../../utils/helpers';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { SocialLoginDto } from './dtos/social-login.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationsService: NotificationsService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async register(input: RegisterDto): Promise<UserDto> {
    const { email, userName } = input;
    const checkEmail = await this.userRepository.findUserByEmail(email);
    if (checkEmail) {
      throw new HttpException(
        ErrorMessages.EMAIL_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkUserName = await this.userRepository.findUserByUserName(
      userName,
    );
    if (checkUserName) {
      throw new HttpException(
        ErrorMessages.USERNAME_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const user = await this.userRepository.createUser(input);
      this.eventEmitter.emit(Events.ON_REGISTRATION, user);
      return user.toUserResponse();
    } catch (e) {
      this.logger.error(`Registration Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Registration Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyEmail(input: VerifyEmailDto): Promise<void> {
    const { token } = input;
    const { email } = this.jwtService.decode(token) as { email: string };
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'Invalid Email verification token',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      user.isConfirmed = true;
      user.status = StatusType.ACTIVE;
      await this.userRepository.save(user);
      return Promise.resolve(undefined);
    } catch (e) {
      this.logger.error(
        `Email Verification Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Email Verification Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendEmailVerification(input: ResendVerificationDto): Promise<void> {
    const { email } = input;
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'User with email not Found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      this.eventEmitter.emit(Events.ON_REGISTRATION, user);
    } catch (e) {
      this.logger.error(
        `Resend Email Verification Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Forgot Password Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(
    input: LoginDto,
  ): Promise<{ user: UserLoginResponse; token: string; tokenExpiry: Date }> {
    const { userName, password } = input;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(`user_name = '${userName}'`)
      .orWhere(`email = '${userName}'`)
      .andWhere('is_deleted = false')
      .getOne();
    if (!user || !user.isPasswordValid(password)) {
      throw new HttpException(
        ErrorMessages.INVALID_LOGIN,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!user.isConfirmed) {
      throw new HttpException('Email Not Verified', HttpStatus.BAD_REQUEST);
    }

    if (user.isDeleted) {
      throw new HttpException(
        'Account has been Deactivated. Please contact Support',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.status === StatusType.INACTIVE) {
      throw new HttpException('User Suspended', HttpStatus.BAD_REQUEST);
    }
    try {
      const notificationCount =
        await this.notificationsService.getUserUnreadNotificationCount(user.id);
      const token = this.jwtService.sign({ email: user.email });
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      return {
        user: {
          ...user.toUserResponse(),
          notificationCount: Number(notificationCount),
        },
        token,
        tokenExpiry: expiryDate,
      };
    } catch (e) {
      this.logger.error(`Login Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException('Login Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async forgotPassword(input: ForgotPasswordDto): Promise<void> {
    const { email } = input;
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'User with email not Found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      user.resetToken = nanoid(10);
      await this.userRepository.save(user);
      this.eventEmitter.emit(Events.ON_FORGOT_PASSWORD, user);
    } catch (e) {
      this.logger.error(`Forgot Password Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Forgot Password Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(input: ResetPasswordDto): Promise<void> {
    const { password, hash } = input;
    const { email, resetToken } = this.jwtService.decode(hash) as {
      email: string;
      resetToken: string;
    };
    const user = await this.userRepository.findUserByEmailAndResetToken(
      email,
      resetToken,
    );
    if (!user) {
      throw new HttpException(
        'Invalid Reset Password Hash',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      user.password = hashPassword(password);
      user.resetToken = null;
      await this.userRepository.save(user);
      return Promise.resolve(undefined);
    } catch (e) {
      this.logger.error(`Reset Password Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Reset Password Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async socialLogin(
    input: SocialLoginDto,
  ): Promise<{ user: UserDto; token: string }> {
    const { email, firstName, lastName, profilePicUrl } = input;
    let user = await this.userRepository.findUserByEmail(email);
    const userName = email.split('@')[0];
    if (!user) {
      user = await this.userRepository.createUser({
        email,
        firstName,
        lastName,
        profilePictureUrl: profilePicUrl,
        userName,
        password: '',
        isConfirmed: true,
        status: StatusType.ACTIVE,
      });
    }
    try {
      const token = this.jwtService.sign({ email });
      return {
        user: user.toUserResponse(),
        token,
      };
    } catch (e) {}
  }

  async updatePassword(userId: number, input: UpdatePasswordDto) {
    const { newPassword, oldPassword } = input;
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    if (!comparePassword(oldPassword, user.password)) {
      throw new HttpException('Invalid Old Password', HttpStatus.NOT_FOUND);
    }
    try {
      user.password = hashPassword(newPassword);
      await this.userRepository.save(user);
    } catch (e) {
      this.logger.error(
        `Unable to Update User Password: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Update User Password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
