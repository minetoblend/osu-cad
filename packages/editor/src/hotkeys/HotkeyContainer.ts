import type { Drawable, List, Vec2 } from "@osucad/framework";
import { CompositeDrawable } from "@osucad/framework";
import { HotkeyListener } from "./HotkeyListener";

export class HotkeyContainer extends CompositeDrawable
{
  #hotkeyListener = new HotkeyListener(this);

  protected override loadComplete()
  {
    super.loadComplete();

    this.addInternal(this.#hotkeyListener);
  }

  public override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean
  {
    if (!super.buildNonPositionalInputQueue(queue, allowBlocking))
      return false;

    queue.remove(this.#hotkeyListener);
    queue.push(this.#hotkeyListener);

    return true;
  }

  public override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean
  {
    if (!super.buildPositionalInputQueue(screenSpacePos, queue))
      return false;

    queue.remove(this.#hotkeyListener);
    queue.push(this.#hotkeyListener);

    return true;
  }
}
