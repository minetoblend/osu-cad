import type { CarouselBeatmapInfo } from './CarouselBeatmapInfo';
import { CarouselItem } from './CarouselItem';

export class CarouselBeatmap extends CarouselItem {
  static HEIGHT = 60;

  constructor(readonly beatmapInfo: CarouselBeatmapInfo) {
    super();
  }

  get totalHeight(): number {
    return CarouselBeatmap.HEIGHT + 5;
  }
}
