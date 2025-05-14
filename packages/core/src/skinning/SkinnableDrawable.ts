import type { Drawable } from "@osucad/framework";
import { Anchor, CompositeDrawable, EmptyDrawable, resolved } from "@osucad/framework";
import { ISkinSource } from "./ISkinSource";
import type { SkinComponentLookup } from "./SkinComponentLookup";

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

    this.updateContent();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.skin.sourceChanged.addListener(this.#skinChanged, this);
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

  resetAnimation()
  {
    // TODO
  }
}
