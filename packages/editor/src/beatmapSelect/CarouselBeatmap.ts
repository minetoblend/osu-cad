import type { BeatmapInfo } from '../beatmaps/BeatmapInfo';
import { CarouselItem } from './CarouselItem';

export class CarouselBeatmap extends CarouselItem {
  static HEIGHT = 60;

  constructor(readonly beatmapInfo: BeatmapInfo) {
    super();
  }

  get totalHeight(): number {
    return CarouselBeatmap.HEIGHT + 5;
  }
}
