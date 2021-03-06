import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { NewCommentDto } from './dto/new-comment.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { ReportsService } from '../reports/reports.service';
import { ReportedType } from '../../entities/report.entity';
import { NewReportDto } from '../reports/dtos/new-report.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly bookmarksService: BookmarksService,
    private readonly reportsService: ReportsService,
  ) {}

  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.postsService.create(userId, createPostDto);
    return new SuccessResponseDto('Post Created Successfully', response);
  }

  @Get('timeline')
  async getUsersTimeline(
    @LoggedInUser('id') userId: number,
    @Query() queryData: BaseQueryDto,
  ) {
    const response = await this.postsService.getUserTimeline(userId, queryData);
    return new SuccessResponseDto('Post Fetched Successfully', response);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @LoggedInUser('id') userId: number) {
    const response = await this.postsService.findOne(+id, userId);
    return new SuccessResponseDto('Successfully', response);
  }

  @Delete(':postId/comments/:commentId')
  async deletePostComment(
    @LoggedInUser('id') userId: number,
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
  ) {
    const response = await this.postsService.deleteComment(
      commentId,
      postId,
      userId,
    );
    return new SuccessResponseDto('Comment Deleted Successfully', response);
  }

  @Patch(':postId/comments/:commentId')
  async updateComment(
    @LoggedInUser('id') userId: number,
    @Param('commentId') commentId: number,
    @Body() input: NewCommentDto,
  ) {
    await this.postsService.ensureUserOwnsPost(userId, commentId);
    const response = await this.postsService.updateComment(commentId, input);
    return new SuccessResponseDto('Comment Updated Successfully', response);
  }

  @Post(':postId/comments')
  async addPostComment(
    @LoggedInUser('id') userId: number,
    @Body() input: NewCommentDto,
    @Param('postId') postId: number,
  ) {
    const response = await this.postsService.addPostComment(
      input,
      postId,
      userId,
    );
    return new SuccessResponseDto('New Comment Added Successfully', response);
  }

  @Delete(':postId/likes')
  async addPostLike(
    @LoggedInUser('id') userId: number,
    @Param('postId') postId: number,
  ) {
    const response = await this.postsService.unLikePost(postId, userId);
    return new SuccessResponseDto(response, null);
  }

  @Post(':postId/likes')
  async RemovePostLike(
    @LoggedInUser('id') userId: number,
    @Param('postId') postId: number,
  ) {
    const response = await this.postsService.addPostLike(postId, userId);
    return new SuccessResponseDto(response, null);
  }

  @Get(':postId/comments')
  async getPostComment(
    @Param('postId') postId: number,
    @Query() queryData: BaseQueryDto,
  ) {
    const response = await this.postsService.getPostComments(postId, queryData);
    return new SuccessResponseDto('Successful', response);
  }

  @Get(':postId/likes')
  async getPostLike(
    @Param('postId') postId: number,
    @Query() queryData: BaseQueryDto,
  ) {
    const response = await this.postsService.getPostLikes(postId, queryData);
    return new SuccessResponseDto('Successful', response);
  }

  @Patch(':postId')
  async updatePost(
    @LoggedInUser('id') userId: number,
    @Param('postId') postId: number,
    @Body() input: UpdatePostDto,
  ) {
    await this.postsService.ensureUserOwnsPost(userId, postId);
    const response = await this.postsService.update(postId, input);
    return new SuccessResponseDto('Post Updated Successfully', response);
  }

  @Delete(':postId')
  async deletePost(
    @Param('postId') postId: number,
    @LoggedInUser('id') userId: number,
  ) {
    await this.postsService.ensureUserOwnsPost(userId, postId);
    const response = await this.postsService.remove(postId);
    return new SuccessResponseDto('Post removed Successfully', response);
  }

  @Post(':postId/bookmark')
  async bookmarkPost(
    @Param('postId') postId: number,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.bookmarksService.addBookmark(userId, postId);
    return new SuccessResponseDto('Post Bookmarked Successfully', response);
  }

  @Delete(':postId/bookmark')
  async removeBookmark(
    @Param('postId') postId: number,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.bookmarksService.removeBookmark(userId, postId);
    return new SuccessResponseDto('Bookmark Removed Successfully', response);
  }

  @Post(':postId/report')
  async reportPost(
    @Param('postId') postId: number,
    @LoggedInUser('id') userId: number,
    @Body() input: NewReportDto,
  ) {
    const response = await this.reportsService.addReport(
      postId,
      ReportedType.POST,
      input,
      userId,
    );
    return new SuccessResponseDto('Post Reported Successfully', response);
  }
}
