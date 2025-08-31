import type { Bindable, ClickEvent, DrawableOptions, FocusEvent, FocusLostEvent, KeyDownEvent } from "@osucad/framework";
import { Anchor, Axes, BindableWithCurrent, Box, CompositeDrawable, dependencyLoader, GraphicsDrawable, Key, Vec2 } from "@osucad/framework";
import { Color, type Graphics } from "pixi.js";
import { EditorColors } from "../EditorColors";

export interface CheckboxOptions extends DrawableOptions
{
  current?: Bindable<boolean>
}

export class Checkbox extends CompositeDrawable
{
  readonly #current = new BindableWithCurrent(false);

  public get current()
  {
    return this.#current;
  }

  public set current(value)
  {
    this.#current.current = value;
  }

  public get checked()
  {
    return this.#current.value;
  }

  public set checked(value)
  {
    this.#current.value = value;
  }

  #background!: Box;
  #check!: Check;

  public constructor(options: CheckboxOptions = {})
  {
    super();

    this.size = new Vec2(22);

    this.with(options);
  }

  @dependencyLoader()
  #load()
  {
    this.masking = true;
    this.cornerRadius = 4;
    this.borderColor = new Color(EditorColors.primary).setAlpha(0.5);

    this.internalChildren = [
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
      }),
      this.#check = new Check({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: 0.5,
        color: EditorColors.primary,
      }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#current.bindValueChanged(e =>
    {
      this.#background.color = e.value ? 0x555559 : 0x333339;

      this.#check.alpha = e.value ? 1 : 0;
    }, true);
  }


  public toggle()
  {
    this.#current.value = !this.#current.value;
  }

  protected override onClick(e: ClickEvent): boolean
  {
    this.toggle();
    return true;
  }

  public override get acceptsFocus(): boolean
  {
    return true;
  }


  protected override onFocus(e: FocusEvent): void
  {
    this.borderThickness = 3;
  }

  protected override onFocusLost(e: FocusLostEvent): void
  {
    this.borderThickness = 0;
  }

  protected override onKeyDown(e: KeyDownEvent): boolean
  {
    if (!this.hasFocus || e.key !== Key.Space)
      return false;

    this.toggle();

    return true;
  }
}

class Check extends GraphicsDrawable
{
  public constructor(options: DrawableOptions)
  {
    super();
    this.with(options);
  }

  protected override updateGraphics(g: Graphics): void
  {
    const { drawWidth, drawHeight } = this;

    const size = Math.min(drawWidth, drawHeight);

    g.clear()
      .moveTo(0, size * 0.5)
      .lineTo(size * 0.4, size * 0.9)
      .lineTo(size, size * 0.1)
      .stroke({
        width: size * 0.3,
        color: 0xffffff,
        cap: "round",
        join: "round",
      });
  }
}
