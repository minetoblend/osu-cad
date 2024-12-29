import type { StableSkin } from '../../../../skinning/stable/StableSkin';
import { SkinTransformer } from '../../../../skinning/SkinTransformer';

export abstract class StableSkinTransformer extends SkinTransformer {
  protected constructor(source: StableSkin) {
    super(source);
  }

  declare source: StableSkin;
}
