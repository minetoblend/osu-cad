/* eslint-disable ts/method-signature-style */
import { AudioChannel, Drawable, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { ISkinComponentLookup } from './ISkinComponentLookup';

export interface ISkin {
  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null;

  getTexture(componentName: string): Texture | null;

  getSample(channel: AudioChannel, name: string): Promise<Sample | null>;

  dispose(): void;

  // getConfig
}
