import {Test, TestingModule} from '@nestjs/testing';
import {BeatmapController} from './beatmap.controller';

describe('BeatmapController', () => {
  let controller: BeatmapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeatmapController],
    }).compile();

    controller = module.get<BeatmapController>(BeatmapController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
