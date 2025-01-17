import type { ISerializer } from '@osucad/multiplayer';
import type { IHasComboColors } from '../skinning/IHasComboColors';
import { SharedObject } from '@osucad/multiplayer';
import { Color } from 'pixi.js';
import { arraySerializer } from '../utils/arraySerializer';

const white = new Color(0xFFFFFF);

const colorSerializer: ISerializer<Color | null, number | null> = {
  serialize(value: Color | null): number | null {
    return value?.toNumber() ?? null;
  },
  deserialize(plain: number | null): Color | null {
    return plain !== null ? new Color(plain) : null;
  },
};

export class BeatmapColors extends SharedObject implements IHasComboColors {
  constructor() {
    super();
  }

  readonly #comboColors = this.property<readonly Color[]>('comboColors', [], arraySerializer(colorSerializer) as unknown as ISerializer<Color[], any>);

  get comboColors(): ReadonlyArray<Color> {
    return this.#comboColors.value;
  }

  set comboColors(value) {
    this.#comboColors.value = value;
  }

  getComboColor(index: number): Color {
    return this.comboColors[index % this.comboColors.length] ?? white;
  }

  addComboColor(color: Color) {
    this.comboColors = [...this.comboColors, color];
  }

  readonly #sliderTrackOverride = this.property<Color | null>('sliderTrackOverride', null, colorSerializer);

  get sliderTrackOverride() {
    return this.#sliderTrackOverride.value;
  }

  readonly #sliderBorder = this.property<Color | null>('sliderBorder', null, colorSerializer);

  get sliderBorder() {
    return this.#sliderBorder.value;
  }
}
