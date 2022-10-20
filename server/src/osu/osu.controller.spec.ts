import {Test, TestingModule} from '@nestjs/testing';
import {OsuController} from './osu.controller';

describe('OsuController', () => {
  let controller: OsuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OsuController],
    }).compile();

    controller = module.get<OsuController>(OsuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
