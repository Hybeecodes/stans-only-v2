import { Like } from '../../../entities/like.entity';

export class LikeDto {
  public id: number;
  public createdAt: Date;
  public author: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
  };

  constructor(like: Like) {
    this.id = like.id;
    this.author = {
      id: like.author.id,
      firstName: like.author.firstName,
      lastName: like.author.lastName,
      userName: like.author.userName,
    };
  }
}
