import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from '../../repositories/post.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { PostMedia } from '../../entities/post-media.entity';
import { PostMediaRepository } from '../../repositories/post-media.repository';
import { PostDetailsDto } from './dto/post-details.dto';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    @InjectRepository(PostMedia)
    private readonly postMediaRepository: PostMediaRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly usersService: UsersService,
  ) {
    this.logger = new Logger(PostsService.name);
  }
  async create(userId: number, createPostDto: CreatePostDto): Promise<boolean> {
    const user = await this.usersService.findUserById(userId);
    try {
      const { media, caption } = createPostDto;
      const post = await this.postRepository.createPost({
        author: user,
        caption,
      });
      for (const url of media) {
        const postMedia = this.postMediaRepository.create({ post, url });
        await this.postMediaRepository.save(postMedia);
      }
      return Promise.resolve(true);
    } catch (e) {
      this.logger.error(`Post Creation Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Create Post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return `This action returns all posts`;
  }

  async findOne(id: number): Promise<PostDetailsDto> {
    const post = await this.postRepository.findPostDetailsById(id);
    return new PostDetailsDto(post);
  }

  async findPostsByUsername(username: string): Promise<PostDto[]> {
    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('Invalid Username', HttpStatus.BAD_REQUEST);
    }
    try {
      const userPosts = await this.postRepository.findPostsByAuthor(user);
      return userPosts.map((p) => {
        return new PostDto(p);
      });
    } catch (e) {
      throw new HttpException(
        'Unable to Fetch User Posts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserTimeline(userId: number) {
    // get list of IDs of user that this user is subscribed to
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.author', 'author')
      // .where(`post.user_id IN ()`);
      .limit(10)
      .offset(0)
      .getMany();

    return posts.map((p) => {
      return new PostDto(p);
    });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
