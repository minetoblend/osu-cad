import type { Color } from 'pixi.js';

export interface IHasComboColors {
  readonly comboColors: ReadonlyArray<Color> | null;
}
