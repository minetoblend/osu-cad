/* eslint-disable ts/method-signature-style */
import type { Drawable, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { ISampleInfo } from './ISampleInfo';

export interface ISkin {
  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null;

  getTexture(componentName: string): Texture | null;

  getSample(sampleInfo: ISampleInfo): Sample | null;

  // getConfig
}
