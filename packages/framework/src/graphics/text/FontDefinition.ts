import type { BitmapFont } from 'pixi.js';
import { Assets } from 'pixi.js';

export class FontDefinition {
  constructor(
    readonly fontUrl: string,
    readonly textureUrl: string,
  ) {}

  get font(): BitmapFont {
    if (!this.#font) {
      throw new Error('Font not loaded');
    }
    return this.#font;
  }

  #font: BitmapFont | null = null;

  async load(): Promise<void> {
    this.#font = await Assets.load({
      src: this.fontUrl,
      loadParser: 'loadBitmapFont',
    });
  }
}
