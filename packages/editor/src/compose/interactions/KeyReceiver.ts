import type { InputKey } from "@osucad/framework";
import { type KeyCombination } from "@osucad/framework";

export interface KeyReceiver
{
  test(key: InputKey, keyCombination: KeyCombination): boolean

  onPressed(key: InputKey, keyCombination: KeyCombination): boolean

  onReleased(key: InputKey,): void
}
