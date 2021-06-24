import { EntityRepository, Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';

@EntityRepository(Subscription)
export class SubscriptionRepository extends Repository<Subscription> {}
