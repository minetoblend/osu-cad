import type { InputManager } from "../../input";
import { Key, type KeyDownEvent } from "../../input";
import type { Drawable } from "../drawables/Drawable";
import { Axes } from "../drawables/Axes";
import { CompositeDrawable } from "./CompositeDrawable";
import type { ContainerOptions } from "./Container";
import { Container } from "./Container";

export class FocusContainer extends Container
{
  public constructor(options: ContainerOptions = {})
  {
    super({
      relativeSizeAxes: Axes.Both,
      ...options,
    });
  }

  #inputManager!: InputManager;

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  protected override onKeyDown(e: KeyDownEvent): boolean
  {
    if (e.key !== Key.Tab)
      return false;

    const currentlyFocused = this.#inputManager.focusedDrawable;

    if (!currentlyFocused?.isRootedAt(this))
      return false;

    e.preventDefault();

    const nextTab = this.#nextTabStop(currentlyFocused, e.shiftPressed);

    if (nextTab !== null)
    {
      this.getContainingInputManager()!.changeFocus(nextTab);

      return true;
    }

    return false;
  }


  #nextTabStop(current: Drawable, reverse: boolean): Drawable | null
  {
    const stack: Drawable[] = [
      this,
      this,
    ];

    let started = false;

    while (stack.length > 0)
    {
      const drawable = stack.pop()!;

      if (!started)
        started = drawable === current;
      else if (drawable.acceptsFocus)
        return drawable;

      if (drawable instanceof CompositeDrawable)
      {
        const newChildren = drawable.aliveInternalChildren;
        let bound = reverse ? newChildren.length : 0;

        if (!started)
        {
          const index = newChildren.indexOf(current);
          if (index !== -1)
            bound = reverse ? index + 1 : index;
        }

        if (reverse)
        {
          for (let i = 0; i < bound; i++)
            stack.push(newChildren[i]);
        }
        else
        {
          for (let i = newChildren.length - 1; i >= bound; i--)
            stack.push(newChildren[i]);
        }
      }
    }

    return null;
  }
}

