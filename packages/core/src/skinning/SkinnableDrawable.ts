import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, EmptyDrawable, resolved } from "@osucad/framework";
import { ISkinSource } from "./ISkinSource";
import type { SkinComponentLookup } from "./SkinComponentLookup";

export class SkinnableDrawable extends CompositeDrawable
{
  public constructor(protected readonly lookup: SkinComponentLookup, protected readonly defaultImplementation?: () => Drawable)
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(ISkinSource)
  protected accessor skin!: ISkinSource;

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

  public drawable!: Drawable;

  protected updateContent()
  {
    this.clearInternal();

    const drawable = this.skin.getDrawableComponent(this.lookup) ?? this.defaultImplementation?.();

    this.drawable = this.internalChild = drawable ?? new EmptyDrawable();

    this.drawable.anchor = Anchor.Center;
    this.drawable.origin = Anchor.Center;
  }

  public override dispose()
  {
    this.skin.sourceChanged.removeListener(this.#skinChanged, this);

    super.dispose();
  }

  public resetAnimation()
  {
    // TODO
  }
}
