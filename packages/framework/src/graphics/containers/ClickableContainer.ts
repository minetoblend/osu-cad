import type { ClickEvent, MouseDownEvent } from "../../input";
import type { Drawable } from "../drawables";
import { BindableBoolean } from "../../bindables";
import { MouseButton } from "../../input";
import { Container } from "./Container";

export class ClickableContainer<T extends Drawable = Drawable> extends Container<T>
{
  #action: (() => void) | null = null;

  public get action()
  {
    return this.#action;
  }

  public set action(value)
  {
    this.#action = value;
    this.enabled.value = this.#action !== null;
  }

  public trigger = ButtonTrigger.Click;

  public readonly enabled = new BindableBoolean();

  protected override onClick(e: ClickEvent): boolean
  {
    if (this.enabled.value && this.trigger === ButtonTrigger.Click)
      this.triggerAction();
    return true;
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (this.enabled.value && this.trigger === ButtonTrigger.MouseDown && e.button === MouseButton.Left)
    {
      this.triggerAction();
    }

    return true;
  }

  protected triggerAction()
  {
    this.action?.();
  }
}

export enum ButtonTrigger
{
  Click,
  MouseDown,
}
