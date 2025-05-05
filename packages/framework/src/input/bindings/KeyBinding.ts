import type { InputKey } from "../state/InputKey";
import type { IKeyBinding } from "./IKeyBinding";
import { KeyCombination } from "./KeyCombination";

export class KeyBinding implements IKeyBinding
{
  constructor(keys: KeyCombination, action: any)
  {
    this.keyCombination = keys;
    this.action = action;
  }

  keyCombination: KeyCombination;

  action: any;

  getAction<T>(): T
  {
    return this.action as T;
  }

  static from(key: InputKey, action: any)
  {
    return new KeyBinding(KeyCombination.from(key), action);
  }
}
