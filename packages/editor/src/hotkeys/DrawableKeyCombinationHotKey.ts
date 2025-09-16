import type { Drawable, KeyCombination } from "@osucad/framework";
import { DrawableHotkey } from "./DrawableHotkey";
import { DrawableKeyCombination } from "./DrawableKeyCombination";

export class DrawableKeyCombinationHotKey extends DrawableHotkey
{
  public constructor(
    public readonly keyCombination: KeyCombination,
    description: string,
  )
  {
    super(description);
  }

  protected override createContent(): Drawable
  {
    return new DrawableKeyCombination(this.keyCombination);
  }
}
