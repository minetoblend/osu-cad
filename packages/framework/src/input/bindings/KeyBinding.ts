import type { InputKey } from "../state/InputKey";
import type { IKeyBinding } from "./IKeyBinding";
import { KeyCombination } from "./KeyCombination";

export class KeyBinding implements IKeyBinding
{
  public constructor(keys: KeyCombination, action: any)
  {
    this.keyCombination = keys;
    this.action = action;
  }

  public keyCombination: KeyCombination;

  public action: any;

  public getAction<T>(): T
  {
    return this.action as T;
  }

  public static from(key: InputKey, action: any)
  {
    return new KeyBinding(KeyCombination.from(key), action);
  }
}
