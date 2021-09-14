import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum LedgerStatus {
  ON_HOLD = 'ON_HOLD',
  RELEASED = 'RELEASED',
}

@Entity('wallet_ledger')
export class WalletLedger extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: '0.0',
  })
  amount: number;

  @Column('enum', { enum: LedgerStatus, default: LedgerStatus.ON_HOLD })
  ledgerStatus: LedgerStatus;
}
