import { EntityRepository, Repository } from 'typeorm';
import { WalletHistory } from '../entities/wallet-history.entity';

@EntityRepository(WalletHistory)
export class WalletHistoryRepository extends Repository<WalletHistory> {}
