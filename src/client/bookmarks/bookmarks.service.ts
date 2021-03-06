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
      }
      await this.bookmarkRepository.update({ user, post }, { isDeleted: true });
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

  async getAllUserBookmarks(userId: number) {
    try {
      const bookmarks = await this.bookmarkRepository.query(`
      SELECT post_id FROM bookmarks WHERE user_id = ${userId} AND is_deleted = false
      `);
      return bookmarks.map((bookmark) => {
        return bookmark.post_id;
      });
    } catch (e) {
      this.logger.error(
        `GET USER Bookmarks Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getUserBookmarksCount(userId: number): Promise<number> {
    try {
      const [{ count }] = await this.bookmarkRepository.query(`
      SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ${userId} AND is_deleted = false
      `);
      return Number(count);
    } catch (e) {
      this.logger.error(
        `Unable to Get User Bookmarks: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Get User Bookmarks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
