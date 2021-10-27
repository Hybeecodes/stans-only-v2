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
import { LikeDto } from './dto/like.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { Post } from '../../entities/post.entity';
import { Like } from '../../entities/like.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { EntityManager } from 'typeorm';
import { NewNotificationDto } from '../notifications/dtos/new-notification.dto';
import { NotificationType } from '../../entities/notification.entity';
import { BlockService } from '../block/block.service';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';

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
    private readonly subscriptionService: SubscriptionService,
    private readonly blockService: BlockService,
    private readonly entityManager: EntityManager,
  ) {
    this.logger = new Logger(PostsService.name);
  }
  async create(userId: number, createPostDto: CreatePostDto): Promise<boolean> {
    if (
      !createPostDto.caption &&
      (!createPostDto.media || createPostDto.media.length === 0)
    ) {
      throw new HttpException(
        'Invalid Post Request: No Body',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.usersService.findUserById(userId);
    const { media, caption } = createPostDto;
    if (media.length > 5) {
      throw new HttpException(
        'Maximum of 5 Media Expected',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const post = await this.postRepository.createPost({
        author: user,
        caption: caption || '',
      });
      for (const { url, mediaType } of media) {
        const postMedia = this.postMediaRepository.create({
          post,
          url,
          mediaType,
        });
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

  async findPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findPostDetailsById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<{
    likesCount: number;
    createdAt: Date;
    comments: Post[];
    commentsCount: number;
    author: {
      id: number;
      firstName: string;
      lastName: string;
      userName: string;
      profilePictureUrl: string;
    };
    isLiked: boolean;
    caption: string;
    id: number;
    media: { url: string; mediaType: string }[];
    likes: Like[];
  }> {
    const post = await this.postRepository.findPostDetailsById(id);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    if (post.author.id !== userId) {
      if (
        !(await this.subscriptionService.hasValidSubscription(
          userId,
          post.author.id,
        ))
      ) {
        throw new HttpException(
          'Sorry, you are not currently subscribed',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const isLiked = await this.likeRepository
      .createQueryBuilder()
      .where(`post_id = ${post.id}`)
      .andWhere(`author_id = ${userId}`)
      .getOne();
    const postResponse = new PostDetailsDto(post);
    return { ...postResponse, isLiked: !!isLiked };
  }

  async findPostsByUsername(
    currentUserId: number,
    username: string,
    queryData: GetPostsQueryDto,
  ): Promise<{ count: number; posts: PostDto[] }> {
    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('Invalid Username', HttpStatus.BAD_REQUEST);
    }
    if (user.id !== currentUserId) {
      if (
        !(await this.subscriptionService.hasValidSubscription(
          currentUserId,
          user.id,
        ))
      ) {
        throw new HttpException(
          'Sorry, you are not currently subscribed',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    try {
      const postIds = await this.getPostsIdsByCriteria(queryData, user.id);
      const { 0: userPosts, 1: count } = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.media', 'media')
        .where('post.is_deleted = false')
        .andWhere('post.parent IS NULL')
        .andWhere(`post.author.id = ${user.id}`)
        .andWhere(`post.id IN (${postIds.length > 0 ? postIds.join(',') : 0})`)
        .orderBy('post.created_at', 'DESC')
        .getManyAndCount();
      return {
        count,
        posts: await this.toPostResponse(userPosts, user.id),
      };
    } catch (e) {
      throw new HttpException(
        'Unable to Fetch User Posts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async toPostResponse(posts: Post[], userId: number) {
    if (posts.length > 0) {
      const postIds: number[] = posts.map((p) => {
        return p.id;
      });
      const likedPosts: { post_id: number }[] = await this.likeRepository.query(
        `SELECT post_id FROM likes WHERE post_id IN (${postIds.join(
          ',',
        )}) AND author_id = ${userId}`,
      );
      const likedPostIds = likedPosts.map((post) => {
        return post.post_id;
      });

      const bookmarkedPosts: { post_id: number }[] =
        await this.entityManager.query(
          `SELECT post_id FROM bookmarks WHERE post_id IN (${postIds.join(
            ',',
          )}) AND user_id = ${userId} AND is_deleted = false`,
        );
      const bookmarkedPostIds = bookmarkedPosts.map((post) => {
        return post.post_id;
      });

      return posts.map((p) => {
        const isLiked = likedPostIds.includes(p.id);
        const isBookmarked = bookmarkedPostIds.includes(p.id);
        const po = new PostDto(p);
        return { ...po, isLiked, isBookmarked };
      });
    } else {
      return posts.map((p) => {
        const po = new PostDto(p);
        return { ...po };
      });
    }
  }

  async getPostsIdsByCriteria(
    queryData: GetPostsQueryDto,
    userId: number,
  ): Promise<number[]> {
    try {
      const { hasText, hasVideo, hasImage, offset, limit } = queryData;
      let mediaWhere = 'WHERE true';
      if (Boolean(hasVideo) && Boolean(hasImage)) {
        mediaWhere += " AND media_type = 'image' || media_type = 'video'";
      } else if (Boolean(hasImage)) {
        mediaWhere += " AND media_type = 'image'";
      } else if (Boolean(hasVideo)) {
        mediaWhere += " AND media_type = 'video'";
      }
      let parentWhere = '';
      if (hasText) {
        parentWhere += " AND caption != '' ";
      }

      if (Boolean(hasVideo) || Boolean(hasImage)) {
        parentWhere += ` AND id IN (SELECT post_id FROM post_media ${mediaWhere})`;
      }
      const postIds: any[] = await this.entityManager.query(
        `SELECT id FROM posts WHERE author_id = ${userId} AND is_deleted = false AND parent_id IS NULL ${parentWhere} ORDER BY created_at DESC LIMIT ${
          limit || 10
        } OFFSET ${offset || 0}`,
      );
      return postIds.map((p) => {
        return p.id;
      });
    } catch (e) {
      this.logger.error(`getPostsIdsByCriteria Failed: ${e.message}`);
      throw new HttpException(
        'Unable to getPostsIdsByCriteria',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserTimeline(userId: number, queryData: BaseQueryDto) {
    // get list of IDs of user that this user is subscribed to
    try {
      const subscriptions: number[] =
        await this.subscriptionService.getAllUserSubscriptions(userId);
      subscriptions.push(userId); // add user Id so we can fetch users posts also
      const blockedUsers: number[] =
        await this.blockService.getAllBlockedUserIds(userId);
      const resultingUserIds = subscriptions.filter((sub) => {
        return !blockedUsers.includes(sub);
      });
      const { offset, limit } = queryData;
      const { 0: posts, 1: count } = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.media', 'media')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.is_deleted = false')
        .andWhere(`post.parent_id IS NULL`)
        .andWhere(
          `post.author_id IN (${
            resultingUserIds.length > 0 ? resultingUserIds.join(',') : 0
          })`,
        )
        .limit(limit || 10)
        .offset(offset || 0)
        .orderBy('post.created_at', 'DESC')
        .getManyAndCount();
      console.log('count', count);
      return {
        count,
        posts: await this.toPostResponse(posts, userId),
      };
    } catch (e) {
      this.logger.error(`getUserTimeline Failed: ${e.message}`);
      throw new HttpException(
        'Unable to Fetch User Timeline',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserBookmarkedPosts(
    bookmarkedPosts: number[],
    queryData: BaseQueryDto,
    userId: number,
  ) {
    // get list of IDs of user that this user is subscribed to
    try {
      const { offset, limit } = queryData;
      const { 0: posts, 1: count } = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.media', 'media')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.is_deleted = false')
        .andWhere(`post.parent_id = null`)
        .andWhere(
          `post.id IN (${
            bookmarkedPosts.length > 0 ? bookmarkedPosts.join(',') : 0
          })`,
        )
        .limit(limit || 10)
        .offset(offset || 0)
        .orderBy('post.created_at', 'DESC')
        .getManyAndCount();
      return {
        count,
        posts: await this.toPostResponse(posts, userId),
      };
    } catch (e) {
      this.logger.error(`getUserTimeline Failed: ${e.message}`);
      throw new HttpException(
        'Unable to Fetch User Timeline',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      const newComment = this.postRepository.create({
        parent: post,
        author,
        caption: message,
      });
      await this.postRepository.save(newComment);
      this.eventEmitter.emit(Events.ON_NEW_COMMENT, postId);
      const notification = new NewNotificationDto();
      notification.senderId = authorId;
      notification.recipientId = post.author.id;
      notification.message = `${author.userName} commented on your post`;
      notification.type = NotificationType.COMMENT;
      notification.meta = { postId, commentId: newComment.id };
      this.eventEmitter.emit(Events.NEW_NOTIFICATION, notification);
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

  async deleteComment(
    commentId: number,
    postId: number,
    userId: number,
  ): Promise<void> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    const comment = await this.postRepository.findOne({
      where: { id: commentId, parent: post, isDeleted: false },
      relations: ['author'],
    });
    if (!comment) {
      throw new HttpException('Comment Not Found', HttpStatus.NOT_FOUND);
    }
    if (userId !== post.author.id && userId !== comment.author.id) {
      throw new HttpException(
        'Sorry, you do not have the permission to delete this comment',
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      comment.isDeleted = true;
      await this.postRepository.save(comment);
      this.eventEmitter.emit(Events.ON_DELETE_COMMENT, postId);
    } catch (e) {
      this.logger.error(
        `Unable to Delete Comment: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to delete Comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async unLikePost(postId: number, authorId: number): Promise<string> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    const isComment = !!post.parent;
    const entity = isComment ? 'Comment' : 'Post';
    const author = await this.usersService.findUserById(authorId);
    try {
      await this.likeRepository.delete({ post, author });
      this.eventEmitter.emit(Events.ON_UNLIKE, postId);
      return `${entity} Unliked Successfully`;
    } catch (e) {
      this.logger.error(`Unable to Unlike Post: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Unlike Post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addPostLike(postId: number, authorId: number): Promise<string> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    const isComment = !!post.parent;
    const author = await this.usersService.findUserById(authorId);
    try {
      const newLike = this.likeRepository.create({
        post,
        author,
      });
      await this.likeRepository.save(newLike);
      const notification = new NewNotificationDto();
      notification.senderId = authorId;
      notification.recipientId = post.author.id;
      const entity = isComment ? 'Comment' : 'Post';
      notification.message = `${author.userName} liked your ${entity}`;
      notification.type = NotificationType.LIKE;
      const commentNotificationMeta = {
        commentId: postId,
        postId: isComment ? post.parent.id : null,
        isComment,
      };
      const postNotificationMeta = { postId, isComment };
      notification.meta = isComment
        ? commentNotificationMeta
        : postNotificationMeta;
      this.eventEmitter.emit(Events.ON_NEW_LIKE, postId);
      this.eventEmitter.emit(Events.NEW_NOTIFICATION, notification);
      return `${entity} Liked Successfully`;
    } catch (e) {
      this.logger.error(`Unable to Like Post: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Like Post',
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

  async decrementPostComments(postId: number): Promise<void> {
    try {
      await this.postRepository.query(
        `UPDATE posts SET comments_count = comments_count-1 WHERE id = ${postId}`,
      );
    } catch (e) {
      this.logger.error(
        `decrementPostComments operation Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getPostComments(postId: number, queryData: BaseQueryDto) {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      const { offset, limit } = queryData;
      const { 0: postComments, 1: count } =
        await this.postRepository.findAndCount({
          where: { parent: post, isDeleted: false },
          relations: ['author', 'likes'],
          skip: offset || 0,
          take: limit || 10,
          order: { createdAt: 'DESC' },
        });
      return {
        count,
        comments: await this.toPostResponse(postComments, post.author.id),
      };
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
  ): Promise<{ count: number; likes: LikeDto[] }> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      const { offset, limit } = queryData;
      const { 0: likeComments, 1: count } =
        await this.likeRepository.findAndCount({
          where: { post },
          relations: ['author'],
          skip: offset || 0,
          take: limit || 10,
        });
      return {
        count,
        likes: likeComments.map((like) => {
          return new LikeDto(like);
        }),
      };
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

  async decrementPostLikes(postId: number): Promise<void> {
    try {
      await this.postRepository.query(
        `UPDATE posts SET likes_count = likes_count-1 WHERE id = ${postId}`,
      );
    } catch (e) {
      this.logger.error(
        `decrementPostLikes operation Failed: ${JSON.stringify(e.message)}`,
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

      const mediaUrls = media.map((pm) => {
        return pm.url;
      });
      for (const { url, mediaType } of media) {
        // add new ones
        if (!postMediaUrl.includes(url)) {
          // insert if it does not exist
          const postMedia = this.postMediaRepository.create({
            post,
            url,
            mediaType,
          });
          await this.postMediaRepository.save(postMedia);
        }
      }
      for (const media of postMediaUrl) {
        if (!mediaUrls.includes(media)) {
          await this.postMediaRepository.delete({ url: media });
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

  async updateComment(
    commentId: number,
    commentDto: NewCommentDto,
  ): Promise<void> {
    const comment = await this.postRepository.findPostById(commentId);
    if (!comment) {
      throw new HttpException('Comment Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      comment.caption = commentDto.message;
      await this.postRepository.save(comment);
    } catch (e) {
      this.logger.error(`Update Comment Failed: ${e.message}`);
      throw new HttpException(
        'Unable to Update Comment',
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

  async ensureUserOwnsPost(userId: number, postId: number, isComment = false) {
    const exist = await this.postRepository
      .createQueryBuilder('post')
      .where(`id = ${postId}`)
      .andWhere(`author_id = ${userId}`)
      .andWhere(`is_deleted = false`)
      .getOne();
    if (!exist) {
      const type = isComment ? 'Comment' : 'Post';
      throw new HttpException(
        `User does not have access to ${type}`,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
