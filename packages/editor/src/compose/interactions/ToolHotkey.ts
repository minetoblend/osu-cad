import type { Drawable, InputKey } from "@osucad/framework";
import { type KeyCombination } from "@osucad/framework";
import type { Interaction } from "./Interaction";

export interface ToolHotkey
{
  test(key: InputKey, keyCombination: KeyCombination): boolean

  onPressed(this: Interaction, key: InputKey, keyCombination: KeyCombination): boolean

  onReleased(this: Interaction,key: InputKey): void

  createDrawable?(): Drawable | undefined
}
