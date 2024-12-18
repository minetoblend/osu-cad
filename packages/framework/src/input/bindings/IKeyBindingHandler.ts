import type { KeyBindingPressEvent } from '../events/KeyBindingPressEvent';
import type { KeyBindingReleaseEvent } from '../events/KeyBindingReleaseEvent';
import type { KeyBindingScrollEvent } from '../events/KeyBindingScrollEvent';
import type { KeyBindingAction } from '../KeyBindingAction';

export interface IKeyBindingHandler<T extends KeyBindingAction> {
  readonly isKeyBindingHandler: true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean;

  onKeyBindingPressed?(e: KeyBindingPressEvent<T>): boolean;

  onKeyBindingReleased?(e: KeyBindingReleaseEvent<T>): void;

  onScrollKeyBinding?(e: KeyBindingScrollEvent<T>): boolean;
}

export function isKeyBindingHandler<T extends KeyBindingAction>(obj: any, binding: T): obj is IKeyBindingHandler<T> {
  return obj.isKeyBindingHandler && obj.canHandleKeyBinding(binding);
}
