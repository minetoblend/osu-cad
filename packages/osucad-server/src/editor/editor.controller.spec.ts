import { Test, TestingModule } from '@nestjs/testing';
import { EditorController } from './editor.controller';

describe('EditorController', () => {
  let controller: EditorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorController],
    }).compile();

    controller = module.get<EditorController>(EditorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
