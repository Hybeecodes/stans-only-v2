import { EntityRepository, Repository } from 'typeorm';
import { Media } from '../entities/media.entity';

@EntityRepository(Media)
export class MediaRepository extends Repository<Media> {
  async createMedia(media: Partial<Media>): Promise<Media> {
    const newMedia = this.create(media);
    return this.save(newMedia);
  }

  async findMediaById(mediaId: number): Promise<Media> {
    return this.findOne(mediaId);
  }
}
