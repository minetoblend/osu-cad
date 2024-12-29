import { Bindable, BindableNumber } from 'osucad-framework';

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

  gridSizeBindable = new Bindable(4);

  get gridSize() {
    return this.gridSizeBindable.value;
  }

  set gridSize(value) {
    this.gridSizeBindable.value = value;
  }

  timelineZoom = Object.assign(new BindableNumber(0), {
    minValue: 0.25,
    maxValue: 8,
  });
}
