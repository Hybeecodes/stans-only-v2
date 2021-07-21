import { Block } from '../../../entities/block.entity';

export class BlockageDto {
  public id: number;
  public user: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    profilePictureUrl: string;
  };
  constructor(block: Block) {
    this.id = block.id;
    this.user = {
      id: block.blocked.id,
      firstName: block.blocked.firstName,
      lastName: block.blocked.lastName,
      userName: block.blocked.userName,
      profilePictureUrl: block.blocked.profilePictureUrl,
    };
  }
}
