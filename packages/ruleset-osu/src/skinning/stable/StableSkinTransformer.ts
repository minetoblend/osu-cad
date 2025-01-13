import type { StableSkin } from '@osucad/common';
import { SkinTransformer } from '@osucad/common';

export abstract class StableSkinTransformer extends SkinTransformer {
  protected constructor(source: StableSkin) {
    super(source);
  }

  declare source: StableSkin;
}
