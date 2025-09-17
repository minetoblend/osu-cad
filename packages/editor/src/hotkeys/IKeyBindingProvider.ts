import type { KeyBinding } from "@osucad/framework";

export interface IKeyBindingProvider
{
  readonly keyBindings: KeyBinding[];
}
