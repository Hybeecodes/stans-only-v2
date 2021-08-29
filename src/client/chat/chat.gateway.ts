import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatEvents } from './chat-events.enum';
import { ConnectedUserDto } from './dtos/connected-user.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger;
  private connectedUsers: ConnectedUserDto[];

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.connectedUsers = [];
  }

  @WebSocketServer()
  wss: Server;
  @SubscribeMessage(ChatEvents.ADD_USER)
  addUser(client: Socket, userId: number): void {
    const newConnectedUser = new ConnectedUserDto(userId, client.id);
    const exists = this.connectedUsers.find((user) => {
      return user.userId === userId;
    });
    if (!exists) this.connectedUsers.push(newConnectedUser);
    this.logger.log(`User Added: ${userId}`);
  }

  @SubscribeMessage(ChatEvents.SEND_MESSAGE)
  sendMessage(client: Socket, payload: any): void {
    this.logger.log(`Send Message Event Received: ${JSON.stringify(payload)}`);
    const { receiverId, ...rest } = payload;
    const { socketId } = this.connectedUsers.find((user) => {
      return user.userId === receiverId;
    });
    this.wss.to(socketId).emit(ChatEvents.NEW_MESSAGE, { ...rest });
    this.logger.log(`New Message Event Emitted: ${JSON.stringify(rest)}`);
  }

  afterInit(server: any): any {
    this.logger.log('Initialized', server);
  }

  handleConnection(client: Socket): any {
    this.logger.log(` Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): any {
    this.connectedUsers = this.connectedUsers.filter((user) => {
      return user.socketId !== client.id;
    });
  }
}
