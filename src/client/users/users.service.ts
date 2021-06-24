import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { UserProfileDto } from './dtos/user-profile.dto';
import { User } from '../../entities/user.entity';
import { StatusType } from '../../shared/constants/status-type.enum';
import { UpdateNotificationSettingsDto } from './dtos/update-notification-settings.dto';
import { NotificationSettingsResponseDto } from './dtos/notification-settings-response.dto';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UserAccountDetailsDto } from './dtos/user-account-details.dto';
import { UpdateUserAccountDetailsDto } from './dtos/update-user-account-details.dto';

@Injectable()
export class UsersService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
    this.logger = new Logger(UsersService.name);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findUserByEmail(email);
  }

  async getUserByUsername(username: string) {
    return this.userRepository.findUserByUserName(username);
  }

  async getUserProfile(username: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findUserByUserName(username);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return new UserProfileDto(user);
  }

  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async updateUserProfile(
    userId: number,
    input: UpdateUserProfileDto,
  ): Promise<void> {
    await this.findUserById(userId);
    try {
      await this.userRepository.update({ id: userId }, { ...input });
    } catch (e) {
      this.logger.error(`Unable to Update User Profile`);
      throw new HttpException(
        'User Profile Update Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserNotificationSettings(
    userId: number,
    input: UpdateNotificationSettingsDto,
  ) {
    const user = await this.findUserById(userId);
    try {
      user.pushNotificationStatus = input.enablePushNotification;
      user.emailNotificationStatus = input.enableEmailNotification;
      await this.userRepository.save(user);
    } catch (e) {
      this.logger.error('Unable to Update User Notification Settings');
      throw new HttpException(
        'Unable to Update User Notification Settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserNotificationSettings(
    userId: number,
  ): Promise<NotificationSettingsResponseDto> {
    const user = await this.findUserById(userId);
    try {
      return new NotificationSettingsResponseDto(user);
    } catch (e) {
      this.logger.error(
        `Unable to User Notification : ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to User Notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.findUserById(userId);
    try {
      user.isDeleted = true;
      await this.userRepository.save(user);
    } catch (e) {
      this.logger.error(`Unable to Delete User: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Delete User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserAccountDetails(userId: number): Promise<UserAccountDetailsDto> {
    const user = await this.findUserById(userId);
    return new UserAccountDetailsDto(user);
  }

  async updateUserAccountDetails(
    userId: number,
    input: UpdateUserAccountDetailsDto,
  ): Promise<void> {
    const user = await this.findUserById(userId);
    try {
      input.subscriptionFee = user.isContentCreator
        ? input.subscriptionFee
        : 0.0;
      await this.userRepository.update({ id: userId }, { ...input });
    } catch (e) {
      this.logger.error(
        `Unable to Update User Account Details: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Update User Account Details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async suspendUser(userId: number): Promise<void> {
    const user = await this.findUserById(userId);
    try {
      user.status = StatusType.INACTIVE;
      await this.userRepository.save(user);
    } catch (e) {
      this.logger.error(`Unable to Suspend User: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Suspend User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async incrementUserSubscribers(userId: number): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET subscribers_count = subscribers_count+1 WHERE id = ${userId}`,
      );
    } catch (e) {
      this.logger.error(
        `incrementUserSubscribers operation Failed: ${JSON.stringify(
          e.message,
        )}`,
      );
    }
  }

  async decrementUserSubscribers(postId: number): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET subscribers_count = subscribers_count-1 WHERE id = ${postId}`,
      );
    } catch (e) {
      this.logger.error(
        `decrementUserSubscribers operation Failed: ${JSON.stringify(
          e.message,
        )}`,
      );
    }
  }
}
