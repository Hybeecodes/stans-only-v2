import { Test, TestingModule } from '@nestjs/testing';
import { AuthEventHandlerService } from './auth-event-handler.service';

describe('AuthEventHandlerService', () => {
  let service: AuthEventHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthEventHandlerService],
    }).compile();

    service = module.get<AuthEventHandlerService>(AuthEventHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
