import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Transaction, TransactionTypes } from './transaction.entity';

export enum PaymentType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum Status {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
}

@Entity('wallet_history')
export class WalletHistory extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Transaction, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'initiator_id' })
  initiator: User;

  @Column({
    name: 'initiator_id',
    nullable: true,
  })
  initiatorId: number;

  @Column('enum', { enum: TransactionTypes })
  type: TransactionTypes;

  @Column('enum', { enum: PaymentType, nullable: true })
  paymentType: PaymentType;

  @Column('enum', { enum: Status, nullable: false, default: Status.PENDING })
  status: Status;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: '0.0',
  })
  amount: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: '0.0',
  })
  fee: number;
}
