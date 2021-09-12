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
import { EntityManager } from 'typeorm';
import { StansFollowingDto } from './dtos/StansFollowing.dto';
import { WalletBalanceDto } from './dtos/wallet-balance.dto';

@Injectable()
export class UsersService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly entityManager: EntityManager,
  ) {
    this.logger = new Logger(UsersService.name);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findUserByEmail(email);
  }

  async getUserByUsername(username: string) {
    return this.userRepository.findUserByUserName(username);
  }

  async getUserProfile(
    username: string,
    currentUserId: number,
  ): Promise<UserProfileDto> {
    const user = await this.userRepository.findUserByUserName(username);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    const { 0: subscription } = await this.entityManager.query(
      `SELECT * FROM subscriptions WHERE subscriber_id = ${currentUserId} AND subscribee_id = ${user.id} AND is_deleted = false LIMIT 1`,
    );

    const profile = new UserProfileDto(user);
    return { ...profile, isSubscribedToUser: Boolean(subscription) };
  }

  async getUserStansFollowingCount(
    userName: string,
  ): Promise<StansFollowingDto> {
    const user = await this.getUserByUsername(userName);
    try {
      const stansCount = await this.getUserStansCount(user.id);
      const followingCount = await this.getUserFollowingCount(user.id);
      const stansFollowingDto = new StansFollowingDto();
      stansFollowingDto.following = followingCount;
      stansFollowingDto.stans = stansCount;
      console.log(stansFollowingDto);
      return stansFollowingDto;
    } catch (e) {
      this.logger.error(
        `Unable to Fetch User Stans and Following Count: ${JSON.stringify(e)}`,
      );
      throw new HttpException(
        'Unable to Fetch User Stans and Following Count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getUserStansCount(userId: number): Promise<number> {
    try {
      const [{ count }] = await this.entityManager.query(
        `SELECT count(*) as count FROM subscriptions WHERE subscribee_id = ${userId} AND is_deleted = false`,
      );
      return count;
    } catch (e) {
      this.logger.error(
        `Unable to Fetch User Stans Count: ${JSON.stringify(e)}`,
      );
      throw new HttpException(
        'Unable to Fetch User Stans Count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getUserFollowingCount(userId: number): Promise<number> {
    try {
      const [{ count }] = await this.entityManager.query(
        `SELECT COUNT(*) as count FROM subscriptions WHERE subscriber_id = ${userId} AND is_deleted = false`,
      );
      return count;
    } catch (e) {
      this.logger.error(
        `Unable to Fetch User Stans Count: ${JSON.stringify(e)}`,
      );
      throw new HttpException(
        'Unable to Fetch User Stans Count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    if (input.userName.trim() === '') {
      throw new HttpException('Invalid Username', HttpStatus.BAD_REQUEST);
    }
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

  async incrementBlockedUsers(userId: number): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET blocked_count = blocked_count+1 WHERE id = ${userId}`,
      );
    } catch (e) {
      this.logger.error(
        `incrementBlockedUsers operation Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getUserWalletBalance(userId: number): Promise<WalletBalanceDto> {
    const user = await this.findUserById(userId);
    try {
      return new WalletBalanceDto(user);
    } catch (e) {
      this.logger.error(
        `Unable to Retrieve User Wallet Balance: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Retrieve User Wallet Balance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async incrementAvailableBalance(
    userId: number,
    amount: number,
  ): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET available_balance = available_balance + ${amount} WHERE id = ${userId}`,
      );
    } catch (e) {
      this.logger.error(
        `incrementAvailableBalance operation Failed: ${JSON.stringify(
          e.message,
        )}`,
      );
      throw new HttpException(
        'An Error Occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async decrementAvailableBalance(
    userId: number,
    amount: number,
  ): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET available_balance = available_balance - ${amount} WHERE id = ${userId}`,
      );
    } catch (e) {
      this.logger.error(
        `decrementAvailableBalance operation Failed: ${JSON.stringify(
          e.message,
        )}`,
      );
      throw new HttpException(
        'An Error Occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async incrementPendingBalance(userId: number, amount: number): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET balance_on_hold =  balance_on_hold + ${amount} WHERE id = ${userId}`,
      );
    } catch (e) {
      this.logger.error(
        `incrementPendingBalance operation Failed: ${JSON.stringify(
          e.message,
        )}`,
      );
      throw new HttpException(
        'An Error Occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async decrementPendingBalance(userId: number, amount: number): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET balance_on_hold =  balance_on_hold - ${amount} WHERE id = ${userId}`,
      );
    } catch (e) {
      this.logger.error(
        `decrementPendingBalance operation Failed: ${JSON.stringify(
          e.message,
        )}`,
      );
      throw new HttpException(
        'An Error Occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async decrementBlockedUsers(postId: number): Promise<void> {
    try {
      await this.userRepository.query(
        `UPDATE users SET blocked_count = blocked_count-1 WHERE id = ${postId}`,
      );
    } catch (e) {
      this.logger.error(
        `decrementBlockedUsers operation Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }
}
