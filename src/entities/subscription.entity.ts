import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum SubscriptionTypes {
  REGULAR = 'REGULAR',
}

@Entity()
export class Subscription extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  subscriber: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  subscribee: User;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column('enum', {
    enum: SubscriptionTypes,
    default: SubscriptionTypes.REGULAR,
  })
  subscriptionType: SubscriptionTypes;
}
