import type { Drawable } from "@osucad/framework";
import { Vec2 } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, dependencyLoader, FillDirection, FillFlowContainer, SpriteText } from "@osucad/framework";

export abstract class DrawableHotkey extends CompositeDrawable
{
  #description: string;
  #descriptionText!: SpriteText;

  public get description()
  {
    return this.#description;
  }

  public set description(value)
  {
    if (this.#description === value)
      return;

    if (this.isLoaded)
      this.#descriptionText.text = value;
  }

  protected constructor(description: string)
  {
    super();

    this.#description = description;
  }

  @dependencyLoader()
  #load()
  {
    this.autoSizeAxes = Axes.Both;

    this.internalChild = new FillFlowContainer({
      autoSizeAxes: Axes.Both,
      direction: FillDirection.Horizontal,
      spacing: new Vec2(4),
      children: [
        this.createContent().with({
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
        new SpriteText({
          text: this.#description,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
          style: {
            fill: 0xffffff,
            fontSize: 14,
          },
        }),
      ],
    });
  }

  protected abstract createContent(): Drawable;
}

