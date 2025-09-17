import type { ActionOrActionType, Drawable } from "@osucad/framework";
import { DrawableHotkey } from "./DrawableHotkey";
import { DrawableKeyBinding } from "./DrawableKeyBinding";

export class DrawableKeyBindingHotkey extends DrawableHotkey
{
  public constructor(public readonly keyBindingAction: ActionOrActionType, label: string)
  {
    super(label);
  }

  #drawableKeyBinding?: DrawableKeyBinding;

  protected override createContent(): Drawable
  {
    return new DrawableKeyBinding(this.keyBindingAction);
  }

  public override get isPresent(): boolean
  {
    return super.isPresent && this.#drawableKeyBinding?.shouldBeAlive !== false;
  }
}
