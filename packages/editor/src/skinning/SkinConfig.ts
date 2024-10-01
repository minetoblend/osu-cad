import type { Color } from 'pixi.js';

export class SkinConfig<T> {
  __type__!: T;

  constructor(readonly name: string) {
  }

  static ComboColors = new SkinConfig<Color[]>('');
}
