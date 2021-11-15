import { Injectable, Logger } from '@nestjs/common';
import * as redis from 'redis';
import { RedisClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly client: RedisClient;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(this.constructor.name);
    this.client = redis.createClient({
      url: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
    });
    this.client.on('error', (error) => {
      this.logger.error(`Redis Connection Failed: ${JSON.stringify(error)}`);
    });
  }

  set(key: string, value: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.client.set(key, value);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }
}
