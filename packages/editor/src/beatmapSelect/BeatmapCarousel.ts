import {
  Anchor,
  Axes,
  Bindable,
  CompositeDrawable,
  Container,
  Direction,
  FillDirection,
  FillFlowContainer,
  Vec2,
} from 'osucad-framework';
import type { BeatmapInfo } from '@osucad/common';
import { MainScrollContainer } from '../editor/MainScrollContainer';
import { BeatmapCarouselItem } from './BeatmapCarouselItem';

export async function getRecentBeatmaps(): Promise<BeatmapInfo[]> {
  const response = await fetch('/api/beatmaps', {
    method: 'GET',
    priority: 'high',
    credentials: 'same-origin',
  });

  return await response.json();
}

export class BeatmapCarousel extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    getRecentBeatmaps().then((beatmaps) => {
      this.beatmaps.value = beatmaps;
      for (const beatmap of beatmaps) {
        this.#items.add(
          new BeatmapCarouselItem(beatmap),
        );
      }
    });

    this.addInternal(this.#content);
    this.#content.relativeSizeAxes = Axes.Both;

    this.#content.add(new Container({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      padding: 10,
      child: this.#items,
    }));
  }

  #content = new MainScrollContainer(Direction.Vertical);

  #items = new FillFlowContainer({
    direction: FillDirection.Vertical,
    width: 500,
    autoSizeAxes: Axes.Y,
    spacing: new Vec2(10),
    maxSize: new Vec2(600, 100),
    anchor: Anchor.TopCenter,
    origin: Anchor.TopCenter,
  });

  beatmaps = new Bindable<BeatmapInfo[]>([]);
}
