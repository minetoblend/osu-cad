import type { StableSkin } from '@osucad/core';
import { SkinTransformer } from '@osucad/core';

export abstract class StableSkinTransformer extends SkinTransformer {
  protected constructor(source: StableSkin) {
    super(source);
  }

  declare source: StableSkin;
}
