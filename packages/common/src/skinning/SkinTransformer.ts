import type { AudioChannel, Drawable, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { HitSample } from '../hitsounds/HitSample';
import type { ISkin } from './ISkin';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { SkinConfig } from './SkinConfig';
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

  getConfig<T>(key: SkinConfig<T>): T | null {
    return this.source.getConfig(key);
  }
}
