import type { KeyDownEvent } from '../../input';
import type { Drawable } from '../drawables';
import { Key } from '../../input';
import { CompositeDrawable } from './CompositeDrawable';
import { Container } from './Container';

export class TabbableContainer<T extends Drawable = Drawable> extends Container<T> {
  get canBeTabbedTo(): boolean {
    return true;
  }

  tabbableContentContainer: CompositeDrawable | null = null;

  override onKeyDown(e: KeyDownEvent): boolean {
    if (this.tabbableContentContainer === null || e.key !== Key.Tab)
      return false;

    const nextTab = this.#nextTabStop(this.tabbableContentContainer, e.shiftPressed);
    if (nextTab !== null)
      this.getContainingInputManager()!.changeFocus(nextTab);

    return true;
  }

  #nextTabStop(target: CompositeDrawable, reverse: boolean): Drawable | null {
    const stack: Drawable[] = [
      target,
      target,
    ];

    let started = false;

    while (stack.length > 0) {
      const drawable = stack.pop()!;

      if (!started)
        started = drawable === this;
      else if (drawable instanceof TabbableContainer && drawable.canBeTabbedTo)
        return drawable;

      if (drawable instanceof CompositeDrawable) {
        const newChildren = drawable.aliveInternalChildren;
        let bound = reverse ? newChildren.length : 0;

        if (!started) {
          const index = newChildren.indexOf(this);
          if (index !== -1)
            bound = reverse ? index + 1 : index;
        }

        if (reverse) {
          for (let i = 0; i < bound; i++)
            stack.push(newChildren[i]);
        }
        else {
          for (let i = newChildren.length - 1; i >= bound; i--)
            stack.push(newChildren[i]);
        }
      }
    }

    return null;
  }

  withTabbableContentContainer(value: CompositeDrawable): this {
    this.tabbableContentContainer = value;
    return this;
  }
}
