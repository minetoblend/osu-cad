import type { IHasComboColors } from '../skinning/IHasComboColors';
import { Color } from 'pixi.js';

const white = new Color(0xFFFFFF);

export class BeatmapColors implements IHasComboColors {
  #comboColors: Color[] = [];

  get comboColors(): ReadonlyArray<Color> {
    return this.#comboColors;
  }

  getComboColor(index: number): Color {
    return this.comboColors[index % this.comboColors.length] ?? white;
  }

  addComboColor(color: Color) {
    this.#comboColors.push(color);
  }

  sliderTrackOverride: Color | null = null;

  sliderBorder: Color | null = null;
}
