import type { AudioChannel, Bindable, Drawable, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';

import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { SkinConfig } from './SkinConfig.ts';

export interface ISkin {
  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null;

  getTexture(componentName: string): Texture | null;

  getSample(channel: AudioChannel, name: string): Sample | null;

  dispose(): void;

  getConfig<T>(key: SkinConfig<T>): Bindable<T> | null;
}
