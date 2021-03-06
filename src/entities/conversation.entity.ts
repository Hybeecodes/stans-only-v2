import { BaseEntity } from './base.entity';
import {
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  Entity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';

export enum ConversationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
}

@Entity()
export class Conversation extends BaseEntity {
  @Column('enum', {
    enum: ConversationType,
    default: ConversationType.ONE_TO_ONE,
  })
  conversationType: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToOne(() => Message)
  @JoinColumn()
  lastMessage: Message;
}
