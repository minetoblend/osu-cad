import type { ISkinSource } from '@osucad/core';
import type { DrawableOptions } from '@osucad/framework';
import { SkinReloadableDrawable } from '@osucad/core';
import { DrawableSprite } from '@osucad/framework';

export class SkinnableSprite extends SkinReloadableDrawable {
  constructor(readonly componentName: string, options: DrawableOptions = {}) {
    super();

    this.with(options);
  }

  protected override skinChanged(skin: ISkinSource): void {
    const texture = skin.getTexture(this.componentName);

    if (!texture) {
      this.clearInternal();
      return;
    }

    this.internalChild = new DrawableSprite({
      texture,
      relativeSizeAxes: this.relativeSizeAxes,
    });
  }
}
