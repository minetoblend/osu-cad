import type { ActionOrActionType, KeyBindingAction } from "@osucad/framework";
import { Axes, CompositeDrawable, KeyBindingContainer } from "@osucad/framework";
import { DrawableKeyCombination } from "./DrawableKeyCombination";

export class DrawableKeyBinding extends CompositeDrawable
{
  public constructor(public readonly keyBindingAction: ActionOrActionType)
  {
    super();

    this.autoSizeAxes = Axes.Both;
  }

  public override get removeWhenNotAlive(): boolean
  {
    return false;
  }

  protected override loadComplete()
  {
    super.loadComplete();

    const keyCombination = this.#getKeyCombination();

    if (keyCombination)
      this.addInternal(new DrawableKeyCombination(keyCombination));
    else
      this.expire();
  }

  #getKeyCombination()
  {
    for (const { keyBindings } of [...this.findParents(it => it instanceof KeyBindingContainer)].toReversed())
    {
      if (!keyBindings)
        continue;

      for (const keyBinding of keyBindings)
      {
        const action = keyBinding.getAction<KeyBindingAction>();

        if (action.equals(this.keyBindingAction))
          return keyBinding.keyCombination;
      }
    }

    return null;
  }
}
