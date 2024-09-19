import type { Drawable } from 'osucad-framework';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { ISkinSource } from './ISkinSource';
import { Anchor, Axes, Cached, EmptyDrawable, FillMode, Vec2 } from 'osucad-framework';
import { SkinReloadableDrawable } from './SkinReloadableDrawable';

enum ConfineMode {
  NoScaling,
  ScaleToFit,
}

export class SkinnableDrawable extends SkinReloadableDrawable {
  #drawable!: Drawable;

  get drawable() {
    return this.#drawable;
  }

  get centerComponent() {
    return true;
  }

  protected readonly componentLookup: ISkinComponentLookup;

  readonly #confineMode: ConfineMode;

  constructor(lookup: ISkinComponentLookup, defaultImplementation?: (lookup: ISkinComponentLookup) => Drawable, confineMode: ConfineMode = ConfineMode.NoScaling) {
    super();

    this.componentLookup = lookup;
    this.#confineMode = confineMode;

    this.relativeSizeAxes = Axes.Both;

    this.#createDefault = defaultImplementation;
  }

  resetAnimation() {
    // TODO
  }

  readonly #createDefault?: (lookup: ISkinComponentLookup) => Drawable;

  readonly #scaling = new Cached();

  #isDefault = false;

  protected createDefault() {
    return this.#createDefault?.(this.componentLookup) ?? new EmptyDrawable();
  }

  protected get applySizeRestrictionsToDefault() {
    return false;
  }

  protected skinChanged(skin: ISkinSource) {
    const retrieved = skin.getDrawableComponent(this.componentLookup);

    if (!retrieved) {
      this.#drawable = this.createDefault();
      this.#isDefault = true;
    }
    else {
      this.#drawable = retrieved;
      this.#isDefault = false;
    }

    this.#scaling.invalidate();

    if (this.centerComponent) {
      this.drawable.anchor = Anchor.Center;
      this.drawable.origin = Anchor.Center;
    }

    if (this.internalChildren.length > 0)
      this.removeInternal(this.internalChild, true);

    this.addInternal(this.drawable);
  }

  update() {
    super.update();

    if (!this.#scaling.isValid) {
      try {
        if (this.#isDefault && !this.applySizeRestrictionsToDefault)
          return;

        switch (this.#confineMode) {
          case ConfineMode.ScaleToFit:
            this.drawable.relativeSizeAxes = Axes.Both;
            this.drawable.size = Vec2.one();
            this.drawable.scale = Vec2.one();
            this.drawable.fillMode = FillMode.Fit;
            break;
        }
      }
      finally {
        this.#scaling.validate();
      }
    }
  }
}
