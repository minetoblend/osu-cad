import type { ClickEvent, MouseDownEvent , Container } from "@osucad/framework";
import { Axes, Box, CompositeDrawable, dependencyLoader, FillDirection, FillFlowContainer, FocusContainer, SpriteText, Vec2 } from "@osucad/framework";
import type { Operator } from "./Operator";

export class OperatorBox extends CompositeDrawable
{
  public constructor(public readonly operator: Operator)
  {
    super();

    this.width = 320;
    this.autoSizeAxes = Axes.Y;
  }

  #content!: Container;

  @dependencyLoader()
  #load()
  {
    this.masking = true;
    this.cornerRadius = 4;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
      }),
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        direction: FillDirection.Vertical,
        padding: 10,
        spacing: new Vec2(10),
        children: [
          new SpriteText({
            text: this.operator.title,
            style: {
              fill: 0xffffff,
              fontSize: 16,
            },
          }),
          this.#content = new FocusContainer({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            child: this.operator.createContent(),
          }),
        ],
      }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    for (let i = 0; i < 2; i++)
      this.#content.updateSubTree();
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    return true;
  }

  protected override onClick(e: ClickEvent): boolean
  {
    return true;
  }
}
