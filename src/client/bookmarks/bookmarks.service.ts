import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BookmarkRepository } from '../../repositories/bookmark.repository';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BookmarksService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(BookmarkRepository)
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {
    this.logger = new Logger(BookmarksService.name);
  }

  async addBookmark(userId: number, postId: number): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    const post = await this.postsService.findPostById(postId);
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { user, post },
      });
      if (!bookmark) {
        const newBookmark = this.bookmarkRepository.create({ user, post });
        await this.bookmarkRepository.save(newBookmark);
      } else if (bookmark.isDeleted) {
        await this.bookmarkRepository.update(
          { user, post },
          { isDeleted: false },
        );
      }
      return Promise.resolve(undefined);
    } catch (e) {
      this.logger.error(
        `Unable to Bookmark Post: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Bookmark Post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeBookmark(userId: number, postId: number): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    const post = await this.postsService.findPostById(postId);
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { user, post },
      });
      if (!bookmark) {
        throw new HttpException('Bookmark Not Found', HttpStatus.BAD_REQUEST);
      } else if (bookmark.isDeleted) {
        await this.bookmarkRepository.update(
          { user, post },
          { isDeleted: false },
        );
      }
      return Promise.resolve(undefined);
    } catch (e) {
      this.logger.error(
        `Unable to Bookmark Post: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Bookmark Post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
