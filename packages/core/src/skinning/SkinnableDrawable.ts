import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, EmptyDrawable, resolved } from "@osucad/framework";
import { ISkinSource } from "./ISkinSource";
import type { SkinComponentLookup } from "./SkinComponentLookup";

export class SkinnableDrawable extends CompositeDrawable
{
  constructor(readonly lookup: SkinComponentLookup, readonly defaultImplementation?: () => Drawable)
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.skin.sourceChanged.addListener(this.#skinChanged, this);
  }

  protected override loadAsyncComplete()
  {
    super.loadAsyncComplete();

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

  resetAnimation()
  {
    // TODO
  }
}
