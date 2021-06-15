import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserAuthGuard } from '../../utils/guards/user-auth.guard';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { NewCommentDto } from './dto/new-comment.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
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
}
