import { Test, TestingModule } from '@nestjs/testing';
import { MailjetService } from './mailjet.service';

describe('MailjetService', () => {
  let service: MailjetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailjetService],
    }).compile();

    service = module.get<MailjetService>(MailjetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
