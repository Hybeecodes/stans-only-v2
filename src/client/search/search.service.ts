import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SearchQueryDto } from './dtos/users-search-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { UserDto } from '../../entities/user.entity';
import { PostRepository } from '../../repositories/post.repository';
import { PostDto } from '../posts/dto/post.dto';

@Injectable()
export class SearchService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
  ) {
    this.logger = new Logger(SearchService.name);
  }

  async searchUsers(
    queryInput: SearchQueryDto,
  ): Promise<{ count: number; users: UserDto[] }> {
    try {
      const { query, limit, offset } = queryInput;
      const { 0: users, 1: count } = await this.userRepository
        .createQueryBuilder('user')
        .where(`user.firstName LIKE '%${query}%'`)
        .orWhere(`user.lastName LIKE '%${query}%'`)
        .orWhere(`user.userName LIKE '%${query}%'`)
        .orWhere(`user.bio LIKE '%${query}%'`)
        .orWhere(`user.location LIKE '%${query}%'`)
        .limit(limit || 10)
        .offset(offset || 0)
        .getManyAndCount();
      return {
        count,
        users: users.map((user) => {
          return user.toUserResponse();
        }),
      };
    } catch (e) {
      this.logger.error(`Search User Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'User Search Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchPosts(
    queryInput: SearchQueryDto,
  ): Promise<{ count: number; posts: PostDto[] }> {
    try {
      const { query, limit, offset } = queryInput;
      const { 0: posts, 1: count } = await this.postRepository
        .createQueryBuilder('post')
        .where(`caption LIKE '%${query}%'`)
        .leftJoinAndSelect('post.author', 'author')
        .limit(limit || 10)
        .offset(offset || 0)
        .getManyAndCount();
      return {
        count,
        posts: posts.map((post) => {
          return new PostDto(post);
        }),
      };
    } catch (e) {
      this.logger.error(`Post User Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Post Search Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
