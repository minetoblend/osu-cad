import type { KeyCombination } from "./KeyCombination";

export interface IKeyBinding
{
  keyCombination: KeyCombination;

  getAction: <T>() => T;
}
