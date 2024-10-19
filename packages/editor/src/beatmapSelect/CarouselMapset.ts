import type { BeatmapItemInfo } from './BeatmapItemInfo';
import type { MapsetInfo } from './MapsetInfo';
import { CarouselBeatmap } from './CarouselBeatmap';
import { CarouselItem } from './CarouselItem';

export class CarouselMapset extends CarouselItem {
  constructor(readonly mapset: MapsetInfo) {
    super();

    this.beatmaps = mapset.beatmaps
      .sort((a, b) => a.starRating - b.starRating)
      .map(beatmap => new CarouselBeatmap(beatmap));

    this.selected.addOnChangeListener(({ value: selected }) => {
      if (selected) {
        if (this.beatmaps.every(it => !it.selected.value))
          (this.beatmaps.find(it => it.visible.value) ?? this.beatmaps[0]).selected.value = true;
      }
      else {
        this.beatmaps.forEach(beatmap => beatmap.selected.value = false);
      }
    }, { immediate: true });

    for (const beatmap of this.beatmaps) {
      beatmap.selected.addOnChangeListener((e) => {
        this.beatmapStateChanged(beatmap, e.value);
      });

      beatmap.beatmapInfo.invalidated.addListener(() => {
        this.beatmaps.sort((a, b) => a.beatmapInfo.starRating - b.beatmapInfo.starRating);
      });
    }
  }

  beatmaps: CarouselBeatmap[];

  static HEIGHT = 80;

  override get totalHeight() {
    return CarouselMapset.HEIGHT + (this.selected.value
      ? this.beatmaps.filter(it => it.visible.value).reduce((acc, beatmap) => acc + beatmap.totalHeight, 0)
      : 0
    );
  }

  beatmapStateChanged(beatmap: CarouselBeatmap, selected: boolean) {
    if (selected) {
      for (const b of this.beatmaps) {
        if (b === beatmap)
          continue;

        b.selected.value = false;
      }

      this.selected.value = true;
    }
  }

  removeBeatmap(beatmap: BeatmapItemInfo) {
    const index = this.beatmaps.findIndex(it => it.beatmapInfo === beatmap);
    if (index >= 0) {
      this.beatmaps.splice(index, 1);

      this.invalidated.emit();
    }
  }
}
