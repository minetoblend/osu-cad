import type { Drawable } from "../../graphics";
import type { KeyBindingPressEvent } from "../events/KeyBindingPressEvent";
import type { KeyBindingReleaseEvent } from "../events/KeyBindingReleaseEvent";
import type { KeyBindingScrollEvent } from "../events/KeyBindingScrollEvent";
import type { KeyBindingAction } from "../KeyBindingAction";

export interface IKeyBindingHandler<T extends KeyBindingAction>
{
  readonly isKeyBindingHandler: true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean;

  onKeyBindingPressed?(e: KeyBindingPressEvent<T>): boolean;

  onKeyBindingReleased?(e: KeyBindingReleaseEvent<T>): void;

  onScrollKeyBinding?(e: KeyBindingScrollEvent<T>): boolean;
}

export function isKeyBindingHandler<D extends Drawable, T extends KeyBindingAction>(obj: D, binding: T): obj is D & IKeyBindingHandler<T>
{
  return (obj as any).isKeyBindingHandler && (obj as any).canHandleKeyBinding(binding);
}
