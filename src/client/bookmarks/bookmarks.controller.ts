import { Controller, Get, Query } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { BookmarksService } from './bookmarks.service';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SuccessResponseDto } from '../../shared/success-response.dto';

@Controller('bookmarks')
export class BookmarksController {
  constructor(
    private readonly postsService: PostsService,
    private readonly bookmarksService: BookmarksService,
  ) {}

  @Get()
  async getUserBookmarkedPosts(
    @LoggedInUser('id') userId: number,
    @Query() queryInput,
  ): Promise<SuccessResponseDto> {
    const bookmarkedPostsList = await this.bookmarksService.getAllUserBookmarks(
      userId,
    );
    const response = await this.postsService.getUserBookmarkedPosts(
      bookmarkedPostsList,
      queryInput,
      userId,
    );
    return new SuccessResponseDto('Successful', response);
  }
}
