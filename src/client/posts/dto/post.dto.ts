import { Post } from '../../../entities/post.entity';

export class PostDto {
  public id: number;
  public caption: string;
  public commentsCount: number;
  public likesCount: number;
  public createdAt: Date;
  public media: string[];
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
    this.media = post.media.map((m) => {
      return m.url;
    });
    this.likesCount = post.likesCount;
    this.author = {
      id: post.author.id,
      firstName: post.author.firstName,
      lastName: post.author.lastName,
      userName: post.author.userName,
    };
    this.createdAt = post.createdAt;
  }
}
