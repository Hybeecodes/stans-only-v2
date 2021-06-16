import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserAuthGuard } from '../../utils/guards/user-auth.guard';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { NewCommentDto } from './dto/new-comment.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';

@UseGuards(UserAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @LoggedInUser('id') userId: number,
  ) {
    const response = await this.postsService.create(userId, createPostDto);
    return new SuccessResponseDto('Post Created Successfully', response);
  }

  @Get('timeline')
  async getUsersTimeline(@LoggedInUser('id') userId: number) {
    const response = await this.postsService.getUserTimeline(userId);
    return new SuccessResponseDto('Post Fetched Successfully', response);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await this.postsService.findOne(+id);
    return new SuccessResponseDto('Successfully', response);
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

  @Post(':postId/likes')
  async addPostLike(
    @LoggedInUser('id') userId: number,
    @Param('postId') postId: number,
  ) {
    const response = await this.postsService.addPostLike(postId, userId);
    return new SuccessResponseDto('New Like Added Successfully', response);
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
}
