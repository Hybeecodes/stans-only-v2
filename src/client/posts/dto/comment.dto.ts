import { Comment } from '../../../entities/comment.entity';

export class CommentDto {
  public id: number;
  public message: string;
  public createdAt: Date;
  public author: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
  };

  constructor(comment: Comment) {
    this.id = comment.id;
    this.message = comment.message;
    this.author = {
      id: comment.author.id,
      firstName: comment.author.firstName,
      lastName: comment.author.lastName,
      userName: comment.author.userName,
    };
    this.createdAt = comment.createdAt;
  }
}
