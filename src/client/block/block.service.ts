import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockRepository } from '../../repositories/block.repository';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../../events/client/events.enum';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { BlockageDto } from './dtos/blockage.dto';
import { Block } from '../../entities/block.entity';

@Injectable()
export class BlockService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(BlockRepository)
    private readonly blockRepository: BlockRepository,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(BlockService.name);
  }

  async blockUser(blockerId: number, blockedUserName: string): Promise<void> {
    const blocked = await this.usersService.getUserByUsername(blockedUserName);
    if (blocked.id === blockerId)
      throw new HttpException(
        'Invalid Action: You can not Block yourself',
        HttpStatus.FORBIDDEN,
      );
    const blocker = await this.usersService.findUserById(blockerId);
    try {
      const blockage = await this.blockRepository.findOne({
        where: { blocker, blocked },
      });
      if (blockage) {
        if (blockage.isDeleted) {
          await this.blockRepository
            .createQueryBuilder('block')
            .update(Block)
            .set({
              isDeleted: false,
            })
            .where('blocker_id = :blockerId AND blocked_id = :blockedId', {
              blockerId,
              blockedId: blocked.id,
            })
            .execute();
        }
      } else {
        const newSubscription = this.blockRepository.create({
          blocked,
          blocker,
        });
        await this.blockRepository.save(newSubscription);
      }
      this.eventEmitter.emit(Events.ON_NEW_USER_BLOCK, blocker.id);
    } catch (e) {
      this.logger.error(`Block User Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Block User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async unblockUser(blockerId: number, blockedUserName: string): Promise<void> {
    const blocker = await this.usersService.findUserById(blockerId);
    const blocked = await this.usersService.getUserByUsername(blockedUserName);
    if (!blocked) {
      throw new HttpException(
        'Invalid username Supplied',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const blockage = await this.blockRepository.findOne({
        where: { blocker, blocked, isDeleted: false },
      });
      if (blockage) {
        blockage.isDeleted = true;
        await this.blockRepository.save(blockage);
        this.eventEmitter.emit(Events.ON_USER_UNBLOCK, blocker.id);
      }
    } catch (e) {
      this.logger.error(`Unblock User Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Unblock',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBlockedUsers(
    userId: number,
    queryData: BaseQueryDto,
  ): Promise<BlockageDto[]> {
    const user = await this.usersService.findUserById(userId);
    try {
      const { limit, offset } = queryData;
      const blockages = await this.blockRepository.find({
        where: { blocker: user, isDeleted: false },
        relations: ['blocked'],
        skip: offset || 0,
        take: limit || 10,
      });
      return blockages.map((blockage) => {
        return new BlockageDto(blockage);
      });
    } catch (e) {
      this.logger.error(
        `GET Blocked Users Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Fetch Blocked User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllBlockedUserIds(userId: number) {
    try {
      const blockages = await this.blockRepository.query(`
      SELECT blocked_id FROM blocks WHERE blocker_id = ${userId} AND is_deleted = false
      `);
      return blockages.map((sub) => {
        return sub.blocked_id;
      });
    } catch (e) {
      this.logger.error(
        `GET Blocked USERS Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getBlockedUsersCount(userId: number) {
    try {
      const [{ count }] = await this.blockRepository.query(`
      SELECT COUNT(*) as count FROM blocks WHERE blocker_id = ${userId} AND is_deleted = false
      `);
      return Number(count);
    } catch (e) {
      this.logger.error(
        `GET Blocked USERS count Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }
}
