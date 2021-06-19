import { Post } from '../../../entities/post.entity';

export class CommentDto {
  public id: number;
  public message: string;
  public createdAt: Date;
  public author: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    profilePictureUrl: string;
  };

  constructor(comment: Post) {
    this.id = comment.id;
    this.message = comment.caption;
    this.author = {
      id: comment.author.id,
      firstName: comment.author.firstName,
      lastName: comment.author.lastName,
      userName: comment.author.userName,
      profilePictureUrl: comment.author.profilePictureUrl,
    };
    this.createdAt = comment.createdAt;
  }
}
