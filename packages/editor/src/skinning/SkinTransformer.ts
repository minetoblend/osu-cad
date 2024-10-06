import type { AudioChannel, Bindable, Drawable, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { HitSample } from '../beatmap/hitSounds/HitSample.ts';
import type { ISkin } from './ISkin.ts';
import type { ISkinComponentLookup } from './ISkinComponentLookup.ts';
import type { SkinConfig } from './SkinConfig.ts';
import { Component } from 'osucad-framework';

export class SkinTransformer extends Component implements ISkin {
  constructor(readonly source: ISkin) {
    super();
  }

  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    return this.source.getDrawableComponent(lookup);
  }

  getTexture(componentName: string): Texture | null {
    return this.source.getTexture(componentName);
  }

  getSample(channel: AudioChannel, sampleInfo: string | HitSample): Sample | null {
    return this.source.getSample(channel, sampleInfo);
  }

  getConfig<T>(key: SkinConfig<T>): Bindable<T> | null {
    return this.source.getConfig(key);
  }
}
