import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserRepository } from '../../repositories/admin-user.repository';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InviteUserDto } from './dtos/invite-user.dto';
import { ErrorMessages } from '../../shared/constants/error-messages.enum';
import { Events } from '../../events/client/events.enum';
import {
  AdminUserDto,
  AdminUserLoginResponse,
} from '../../entities/admin-user.entity';
import { AdminLoginDto } from './dtos/login.dto';
import { StatusType } from '../../shared/constants/status-type.enum';
import { VerifyEmailDto } from '../../client/auth/dtos/verify-email.dto';
import { ResendVerificationDto } from '../../client/auth/dtos/resend-verification.dto';
import { ForgotPasswordDto } from '../../client/auth/dtos/forgot-password.dto';
import { nanoid } from 'nanoid';
import { ResetPasswordDto } from '../../client/auth/dtos/reset-password.dto';
import { comparePassword, hashPassword } from '../../utils/helpers';
import { UpdatePasswordDto } from '../../client/auth/dtos/update-password.dto';
import { AdminEvents } from '../../events/admin/events.enum';

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(AdminUserRepository)
    private readonly adminRepository: AdminUserRepository,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async inviteAdminUser(input: InviteUserDto): Promise<AdminUserDto> {
    const { email, userName } = input;
    const checkEmail = await this.adminRepository.findOne({
      where: { email, isDeleted: false },
    });
    if (checkEmail) {
      throw new HttpException(
        ErrorMessages.EMAIL_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkUserName = await this.adminRepository.findOne({
      where: { userName, isDeleted: false },
    });
    if (checkUserName) {
      throw new HttpException(
        ErrorMessages.USERNAME_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const adminUser = this.adminRepository.create(input);
      this.eventEmitter.emit(AdminEvents.ON_NEW_ADMIN_USER, adminUser);
      return adminUser.toUserResponse();
    } catch (e) {
      this.logger.error(`Admin User Invitation: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Invitation Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(
    input: AdminLoginDto,
  ): Promise<{ user: AdminUserLoginResponse; token: string }> {
    const { userName, password } = input;
    const user = await this.adminRepository
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
      const token = this.jwtService.sign({ email: user.email });
      return {
        user: {
          ...user.toUserResponse(),
        },
        token,
      };
    } catch (e) {
      this.logger.error(`Login Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException('Login Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyEmail(input: VerifyEmailDto): Promise<void> {
    const { token } = input;
    const { email } = this.jwtService.decode(token) as { email: string };
    const user = await this.adminRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'Invalid Email verification token',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      user.isConfirmed = true;
      user.status = StatusType.ACTIVE;
      await this.adminRepository.save(user);
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
    const user = await this.adminRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'User with email not Found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      this.eventEmitter.emit(AdminEvents.ON_NEW_ADMIN_USER, user);
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

  async forgotPassword(input: ForgotPasswordDto): Promise<void> {
    const { email } = input;
    const user = await this.adminRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'User with email not Found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      user.resetToken = nanoid(10);
      await this.adminRepository.save(user);
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
    const user = await this.adminRepository.findUserByEmailAndResetToken(
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
      await this.adminRepository.save(user);
      return Promise.resolve(undefined);
    } catch (e) {
      this.logger.error(`Reset Password Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Reset Password Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword(userId: number, input: UpdatePasswordDto) {
    const { newPassword, oldPassword } = input;
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    if (!comparePassword(oldPassword, user.password)) {
      throw new HttpException('Invalid Old Password', HttpStatus.NOT_FOUND);
    }
    try {
      user.password = hashPassword(newPassword);
      await this.adminRepository.save(user);
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
