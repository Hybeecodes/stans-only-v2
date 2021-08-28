export class ConnectedUserDto {
  constructor(userId: number, socketId: string) {
    this.userId = userId;
    this.socketId = socketId;
  }

  userId: number;
  socketId: string;
}
