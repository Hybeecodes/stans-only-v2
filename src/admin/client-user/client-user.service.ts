import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { GetAllUsersQueryDto } from './dtos/get-all-users-query.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { StatusType } from '../../shared/constants/status-type.enum';
import { AuthService } from '../../client/auth/auth.service';

@Injectable()
export class ClientUserService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly userAuthService: AuthService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async getAllUsers(
    query: GetAllUsersQueryDto,
  ): Promise<{ count: number; users: UserResponseDto[] }> {
    try {
      const { isContentCreator, limit, offset } = query;
      const builder = this.userRepository
        .createQueryBuilder('user')
        .where('is_deleted = false');

      if (Boolean(isContentCreator)) {
        builder.andWhere(`isContentCreator = ${isContentCreator}`);
      }
      const [users, count] = await builder
        .limit(limit || 10)
        .offset(offset || 0)
        .getManyAndCount();
      return {
        count,
        users: users.map((user) => new UserResponseDto(user)),
      };
    } catch (e) {
      this.logger.error(
        `Unable to retrieve Stansonly users: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable is retrieve Stansonly users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserInfo(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return new UserResponseDto(user);
  }

  async suspendUser(userId: number): Promise<void> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.isSuspended = true;
    await this.userRepository.save(user);
  }

  async unSuspendUser(userId: number): Promise<void> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.isSuspended = false;
    await this.userRepository.save(user);
  }

  async deactivateUser(userId: number): Promise<void> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.status = StatusType.INACTIVE;
    await this.userRepository.save(user);
  }

  async activateUser(userId: number): Promise<void> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.status = StatusType.ACTIVE;
    await this.userRepository.save(user);
  }

  async initiatePasswordReset(userId: number): Promise<void> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.userAuthService.forgotPassword({ email: user.email });
  }
}
