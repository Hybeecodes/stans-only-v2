import { ChatMedia } from 'src/entities/chat-media.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ChatMedia)
export class ChatMediaRepository extends Repository<ChatMedia> {}
