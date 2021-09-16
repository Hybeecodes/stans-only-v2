import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum PaymentProviders {
  FLUTTERWAVE = 'FLUTTERWAVE',
}

export enum TransactionTypes {
  TOP_UP = 'TOP_UP',
  WITHDRAWAL = 'WITHDRAWAL',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column('varchar')
  currency: string;

  @Column('decimal', {
    precision: 12,
    scale: 2,
  })
  amount: number;

  @Index('idx_transaction_reference', { unique: true })
  @Column('varchar', {
    length: 45,
  })
  reference: string;

  @Column({
    type: 'int',
  })
  transactionId: number;

  @Column('enum', { enum: PaymentProviders })
  paymentProvider: PaymentProviders;

  @Column('enum', { enum: TransactionTypes })
  transactionType: TransactionTypes;

  @Column('text')
  description: string;

  @Column('text', { nullable: true, default: null })
  meta: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: User;

  @Column({ type: 'datetime' })
  paymentDate: Date;
}