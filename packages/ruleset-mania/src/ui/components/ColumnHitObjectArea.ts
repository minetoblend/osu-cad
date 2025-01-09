import type { HitObjectContainer } from '@osucad/common';
import type { DrawableOptions } from 'osucad-framework';
import { SkinnableDrawable } from '@osucad/common';
import { Axes } from 'osucad-framework';
import { ManiaSkinComponentLookup } from '../../skinning/ManiaSkinComponentLookup';
import { ManiaSkinComponents } from '../../skinning/ManiaSkinComponents';
import { HitObjectArea } from '../HitObjectArea';

export class ColumnHitObjectArea extends HitObjectArea {
  constructor(hitObjectContainer: HitObjectContainer, options: DrawableOptions) {
    super(hitObjectContainer, options);

    this.addAllInternal(
      new SkinnableDrawable(new ManiaSkinComponentLookup(ManiaSkinComponents.HitTarget)).with({
        relativeSizeAxes: Axes.Both,
        depth: 1,
      }),
    );
  }
}
