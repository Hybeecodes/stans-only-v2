import { Test, TestingModule } from '@nestjs/testing';
import { PostEventHandlerService } from './post-event-handler.service';

describe('PostEventHandlerService', () => {
  let service: PostEventHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostEventHandlerService],
    }).compile();

    service = module.get<PostEventHandlerService>(PostEventHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
