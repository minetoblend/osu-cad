import type { AudioChannel, Drawable, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { HitSample } from '../hitsounds/HitSample';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { SkinConfigurationLookup } from './SkinConfigurationLookup';

export interface ISkin {
  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null;

  getTexture(componentName: string): Texture | null;

  getSample(channel: AudioChannel, sampleInfo: string | HitSample): Sample | null;

  dispose(): void;

  getConfig<T>(key: SkinConfigurationLookup<T>): T | null;
}
