import type { BeatmapItemInfo } from './BeatmapItemInfo';
import { CarouselItem } from './CarouselItem';

export class CarouselBeatmap extends CarouselItem {
  static HEIGHT = 60;

  constructor(readonly beatmapInfo: BeatmapItemInfo) {
    super();
  }

  get totalHeight(): number {
    return CarouselBeatmap.HEIGHT + 5;
  }
}
