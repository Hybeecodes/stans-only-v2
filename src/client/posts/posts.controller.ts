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

  @Get()
  findAll() {
    return this.postsService.findAll();
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
}