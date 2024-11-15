import type { Drawable, KeyBindingAction, KeyBindingContainer, SimultaneousBindingMode } from 'osucad-framework';
import type { Ruleset } from '../Ruleset';
import { Axes, Container, PassThroughInputManager } from 'osucad-framework';
import { RulesetKeyBindingContainer } from './RulesetKeyBindingContainer';

export class RulesetInputManager<T extends KeyBindingAction> extends PassThroughInputManager {
  override get allowRightClickFromLongTouch(): boolean {
    return false;
  }

  readonly keyBindingContainer: KeyBindingContainer<T>;

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  constructor(ruleset: Ruleset, unique: SimultaneousBindingMode) {
    super();

    this.internalChild = this.keyBindingContainer
      = this.createKeyBindingContainer(ruleset, unique)
        .with({
          child: this.#content = new Container({ relativeSizeAxes: Axes.Both }),
        });
  }

  createKeyBindingContainer(ruleset: Ruleset, unique: SimultaneousBindingMode): KeyBindingContainer<T> {
    return new RulesetKeyBindingContainer(ruleset, unique);
  }
}
