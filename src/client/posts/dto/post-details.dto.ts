import { Post } from '../../../entities/post.entity';
import { Like } from '../../../entities/like.entity';

export class PostDetailsDto {
  public id: number;
  public caption: string;
  public commentsCount: number;
  public likesCount: number;
  public createdAt: Date;
  public media: string[];
  public comments: Post[];
  public likes: Like[];
  public author: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
  };

  constructor(post: Post) {
    this.id = post.id;
    this.caption = post.caption;
    this.commentsCount = post.commentsCount;
    this.likesCount = post.likesCount;
    this.comments = post.comments;
    this.likes = post.likes;
    this.media = post.media.map((m) => {
      return m.url;
    });
    this.author = {
      id: post.author.id,
      firstName: post.author.firstName,
      lastName: post.author.lastName,
      userName: post.author.userName,
    };
    this.createdAt = post.createdAt;
  }
}
