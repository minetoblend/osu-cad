import type { ClickEvent, MouseDownEvent, MouseUpEvent } from "@osucad/framework";
import { Anchor, Axes, BindableBoolean, Box, Container, DrawableSprite, EasingFunction, FillMode, MouseButton, resolved, Vec2 } from "@osucad/framework";
import { ComposeToolbar } from "../tools";
import type { ComposeToolInfo } from "./ComposeToolInfo";
import { ActiveToolBindable } from "./ActiveToolBindable";
import { EditorColors } from "../../EditorColors";

export class ComposeToolButton extends Container
{
  constructor(readonly tool: ComposeToolInfo)
  {
    super();

    this.size = new Vec2(ComposeToolbar.WIDTH);

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      masking: true,
      cornerRadius: 8,
      cornerExponent: 2.5,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      borderColor: EditorColors.primary,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          alpha: 0.8,
          color: 0x222228,
        }),
        new Container({
          relativeSizeAxes: Axes.Both,
          size: 0.7,
          anchor: Anchor.Center,
          origin: Anchor.Center,
          child: this.#icon = new DrawableSprite({
            texture: this.tool.icon,
            relativeSizeAxes: Axes.Both,
            fillMode: FillMode.Fit,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
        }),
      ],
    }));
  }

  readonly #content: Container;
  readonly #icon: DrawableSprite;

  @resolved(ActiveToolBindable)
  accessor #activeTool!: ActiveToolBindable

  protected override loadComplete()
  {
    super.loadComplete();

    this.#activeTool.bindValueChanged(tool =>
    {
      if (tool.value === this.tool)
      {
        this.#icon.fadeColor(EditorColors.primary);
        this.#content.transformTo("borderThickness", 3, 100);
      }
      else
      {
        this.#icon.fadeColor(0xffffff);
        this.#content.transformTo("borderThickness", 0, 100);
      }
    }, true);
  }

  override onMouseDown(e: MouseDownEvent)
  {
    if (e.button !== MouseButton.Left)
      return true;

    this.#content.scaleTo(0.95, 400, EasingFunction.OutExpo);
    this.#icon.scaleTo(0.85, 400, EasingFunction.OutExpo);
    return true;
  }

  override onMouseUp(e: MouseUpEvent)
  {
    if (e.button !== MouseButton.Left)
      return;

    this.#content.scaleTo(1, 400, EasingFunction.OutElasticHalf);
    this.#icon.scaleTo(1, 400, EasingFunction.OutElasticHalf);
  }

  override onClick(e: ClickEvent)
  {
    this.select();
    return true;
  }

  select()
  {
    this.#activeTool.value = this.tool;
  }
}
