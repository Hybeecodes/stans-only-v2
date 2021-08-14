import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(8082, { namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(this.constructor.name);

  @WebSocketServer()
  wss: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, text: string): WsResponse<string> {
    return { event: 'message', data: 'Hello world!' };
  }

  afterInit(server: any): any {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]): any {
    this.logger.log(` Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }
}
