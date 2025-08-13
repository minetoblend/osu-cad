import type { KeyDownEvent, ContainerOptions } from "@osucad/framework";
import { Anchor, Axes, Bindable, clamp, Container, EasingFunction, Key, Vec2 } from "@osucad/framework";

export class UIScaleContainer extends Container
{
  readonly #content: Container;

  override get content()
  {
    return this.#content;
  }

  constructor(options: ContainerOptions = {})
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    this.with(options);
  }

  #targetScale = 1;

  readonly scaleBindable = new Bindable(1);

  protected override loadComplete()
  {
    super.loadComplete();

    this.scaleBindable.bindValueChanged(e =>
    {
      this.#content.scale = new Vec2(e.value);
      this.#content.size = new Vec2(1 / e.value);
    });
  }

  override onKeyDown(e: KeyDownEvent)
  {
    if (e.controlPressed)
    {
      if (e.key === Key.Equal)
      {
        this.#targetScale = clamp(this.#targetScale + 0.05, 0.5, 1.5);
        this.transformBindableTo(this.scaleBindable, this.#targetScale, 600, EasingFunction.OutExpo);
        return true;
      }
      else if (e.key === Key.Minus)
      {
        this.#targetScale = clamp(this.#targetScale - 0.05, 0.5, 1.5);
        this.transformBindableTo(this.scaleBindable, this.#targetScale, 600, EasingFunction.OutExpo);
        return true;
      }
    }

    return false;
  }
}
