import type { Drawable } from "@osucad/framework";
import { Anchor, CompositeDrawable, EmptyDrawable, resolved } from "@osucad/framework";
import type { SkinComponentLookup } from "./ISkin";
import { ISkinSource } from "./ISkinSource";

export class SkinnableDrawable extends CompositeDrawable
{
  constructor(readonly lookup: SkinComponentLookup, readonly defaultImplementation?: () => Drawable)
  {
    super();
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected override loadAsyncComplete()
  {
    super.loadAsyncComplete();

    this.skin.sourceChanged.addListener(this.#skinChanged, this);
    this.updateContent();
  }

  #skinChanged()
  {
    this.scheduler.addOnce(this.onSkinChanged, this);
  }

  protected onSkinChanged()
  {
    this.updateContent();
  }

  drawable!: Drawable;

  updateContent()
  {
    this.clearInternal();

    const drawable = this.skin.getDrawableComponent(this.lookup) ?? this.defaultImplementation?.();

    this.drawable = this.internalChild = drawable ?? new EmptyDrawable();

    this.drawable.anchor = Anchor.Center;
    this.drawable.origin = Anchor.Center;
  }

  override dispose(isDisposing?: boolean)
  {
    super.dispose(isDisposing);

    this.skin.sourceChanged.removeListener(this.#skinChanged, this);
  }
}
