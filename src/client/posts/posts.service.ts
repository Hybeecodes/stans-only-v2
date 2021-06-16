import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from '../../repositories/post.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { PostMediaRepository } from '../../repositories/post-media.repository';
import { PostDetailsDto } from './dto/post-details.dto';
import { PostDto } from './dto/post.dto';
import { NewCommentDto } from './dto/new-comment.dto';
import { CommentRepository } from '../../repositories/comment.repository';
import { Events } from '../../events/client/events.enum';
import { LikeRepository } from '../../repositories/like.repository';
import { CommentDto } from './dto/comment.dto';
import { LikeDto } from './dto/like.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';

@Injectable()
export class PostsService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    @InjectRepository(PostMediaRepository)
    private readonly postMediaRepository: PostMediaRepository,
    @InjectRepository(CommentRepository)
    private readonly commentRepository: CommentRepository,
    @InjectRepository(LikeRepository)
    private readonly likeRepository: LikeRepository,
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
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
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
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    return posts.map((p) => {
      return new PostDto(p);
    });
  }

  async addPostComment(
    input: NewCommentDto,
    postId: number,
    authorId: number,
  ): Promise<void> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    const author = await this.usersService.findUserById(authorId);
    try {
      const { message } = input;
      const newComment = this.commentRepository.create({
        post,
        author,
        message,
      });
      await this.commentRepository.save(newComment);
      this.eventEmitter.emit(Events.ON_NEW_COMMENT, postId);
    } catch (e) {
      this.logger.error(
        `Unable to Add new Comment: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Add new Comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addPostLike(postId: number, authorId: number): Promise<void> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    const author = await this.usersService.findUserById(authorId);
    try {
      const newLike = this.likeRepository.create({
        post,
        author,
      });
      await this.likeRepository.save(newLike);
      this.eventEmitter.emit(Events.ON_NEW_LIKE, postId);
    } catch (e) {
      this.logger.error(
        `Unable to Add new Comment: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Add new Comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async incrementPostComments(postId: number): Promise<void> {
    try {
      await this.postRepository.query(
        `UPDATE posts SET comments_count = comments_count+1 WHERE id = ${postId}`,
      );
    } catch (e) {
      this.logger.error(
        `incrementPostComments operation Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getPostComments(
    postId: number,
    queryData: BaseQueryDto,
  ): Promise<CommentDto[]> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      const { offset, limit } = queryData;
      const postComments = await this.commentRepository.find({
        where: { post },
        relations: ['author'],
        skip: offset || 0,
        take: limit || 10,
      });
      return postComments.map((comment) => {
        return new CommentDto(comment);
      });
    } catch (e) {
      this.logger.error(`getPostComments Failed: ${e.message}`);
      throw new HttpException(
        'Unable to Fetch Post Comments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPostLikes(
    postId: number,
    queryData: BaseQueryDto,
  ): Promise<LikeDto[]> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      const { offset, limit } = queryData;
      const likeComments = await this.likeRepository.find({
        where: { post },
        relations: ['author'],
        skip: offset || 0,
        take: limit || 10,
      });
      return likeComments.map((like) => {
        return new LikeDto(like);
      });
    } catch (e) {
      this.logger.error(`getPostLikes Failed: ${e.message}`);
      throw new HttpException(
        'Unable to Fetch Post Likes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async incrementPostLikes(postId: number): Promise<void> {
    try {
      await this.postRepository.query(
        `UPDATE posts SET likes_count = likes_count+1 WHERE id = ${postId}`,
      );
    } catch (e) {
      this.logger.error(
        `incrementPostLikes operation Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async update(postId: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      const { media, caption } = updatePostDto;
      post.caption = caption;
      await this.postRepository.save(post);
      const postMedia = await this.postMediaRepository.find({
        where: { post },
        select: ['url'],
      });
      const postMediaUrl = postMedia.map((pm) => {
        return pm.url;
      });
      for (const url of media) {
        // add new ones
        if (!postMediaUrl.includes(url)) {
          // insert if it does not exist
          const postMedia = this.postMediaRepository.create({ post, url });
          await this.postMediaRepository.save(postMedia);
        }
      }
      for (const url of postMediaUrl) {
        if (!media.includes(url)) {
          await this.postMediaRepository.delete({ url });
        }
      }
    } catch (e) {
      this.logger.error(`Update Post Failed: ${e.message}`);
      throw new HttpException(
        'Unable to Update Post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(postId: number): Promise<void> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      post.isDeleted = true;
      await this.postRepository.save(post);
    } catch (e) {
      this.logger.error(`Delete Post Failed: ${e.message}`);
      throw new HttpException(
        'Unable to Delete Post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async ensureUserOwnsPost(userId: number, postId: number) {
    const exist = await this.postRepository
      .createQueryBuilder('post')
      .where(`id = ${postId}`)
      .andWhere(`author_id = ${userId}`)
      .andWhere(`is_deleted = false`)
      .getOne();
    if (!exist) {
      throw new HttpException(
        'User does not have access to Post',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
