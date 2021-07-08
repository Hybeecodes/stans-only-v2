import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventHandlerService } from './notification-event-handler.service';

describe('NotificationEventHandlerService', () => {
  let service: NotificationEventHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationEventHandlerService],
    }).compile();

    service = module.get<NotificationEventHandlerService>(
      NotificationEventHandlerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
