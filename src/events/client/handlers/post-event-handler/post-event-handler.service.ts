import { Injectable, Logger } from '@nestjs/common';
import { PostsService } from '../../../../client/posts/posts.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../events.enum';
import { UsersService } from '../../../../client/users/users.service';

@Injectable()
export class PostEventHandlerService {
  private readonly logger: Logger;

  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {
    this.logger = new Logger(PostEventHandlerService.name);
  }

  @OnEvent(Events.ON_NEW_POST, { async: true })
  async onNewPostHandler(postId: number): Promise<void> {
    try {
      await this.usersService.incrementUserUploadsCount(postId);
    } catch (e) {
      this.logger.error(`onNewPostHandler: ${JSON.stringify(e)}`);
    }
  }

  @OnEvent(Events.ON_DELETE_POST, { async: true })
  async onRemovePostHandler(postId: number): Promise<void> {
    try {
      await this.usersService.decrementUserUploadsCount(postId);
    } catch (e) {
      this.logger.error(`onRemovePostHandler: ${JSON.stringify(e)}`);
    }
  }

  @OnEvent(Events.ON_NEW_COMMENT, { async: true })
  async onNewCommentHandler(postId: number): Promise<void> {
    try {
      await this.postsService.incrementPostComments(postId);
    } catch (e) {
      this.logger.error(`onNewCommentHandler: ${JSON.stringify(e)}`);
    }
  }

  @OnEvent(Events.ON_DELETE_COMMENT, { async: true })
  async onDeleteCommentHandler(postId: number): Promise<void> {
    try {
      await this.postsService.decrementPostComments(postId);
    } catch (e) {
      this.logger.error(`onNewCommentHandler: ${JSON.stringify(e)}`);
    }
  }

  @OnEvent(Events.ON_NEW_LIKE, { async: true })
  async onNewLikeHandler(postId: number): Promise<void> {
    try {
      await this.postsService.incrementPostLikes(postId);
    } catch (e) {
      this.logger.error(`onNewLikeHandler: ${JSON.stringify(e)}`);
    }
  }

  @OnEvent(Events.ON_UNLIKE, { async: true })
  async onUnLikeHandler(postId: number): Promise<void> {
    try {
      await this.postsService.decrementPostLikes(postId);
    } catch (e) {
      this.logger.error(`onNewLikeHandler: ${JSON.stringify(e)}`);
    }
  }
}
