import { Test, TestingModule } from '@nestjs/testing';
import { BlockageEventHandlerService } from './blockage-event-handler.service';

describe('BlockageEventHandlerService', () => {
  let service: BlockageEventHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockageEventHandlerService],
    }).compile();

    service = module.get<BlockageEventHandlerService>(
      BlockageEventHandlerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
