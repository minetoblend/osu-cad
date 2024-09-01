import { Bindable } from 'osucad-framework';

export class BeatmapEditorSettings {
  bookmarks: number[] = [];
  distanceSpacing = 1;

  beatDivisorBindable = new Bindable(4);

  get beatDivisor() {
    return this.beatDivisorBindable.value;
  }

  set beatDivisor(value) {
    this.beatDivisorBindable.value = value;
  }

  gridSize = 4;

  timelineZoom = 1;
}
