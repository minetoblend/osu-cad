import { Test, TestingModule } from '@nestjs/testing';
import { PulsarService } from './pulsar.service';

describe('PulsarService', () => {
  let service: PulsarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PulsarService],
    }).compile();

    service = module.get<PulsarService>(PulsarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
