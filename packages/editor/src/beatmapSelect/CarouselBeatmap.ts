import type { MapsetBeatmapInfo } from '@osucad/common';
import { CarouselItem } from './CarouselItem';

export class CarouselBeatmap extends CarouselItem {
  static HEIGHT = 60;

  constructor(readonly beatmapInfo: MapsetBeatmapInfo) {
    super();
  }

  get totalHeight(): number {
    return CarouselBeatmap.HEIGHT + 5;
  }
}
