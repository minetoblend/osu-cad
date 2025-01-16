import type { Drawable, KeyBindingAction, KeyBindingContainer, SimultaneousBindingMode } from '@osucad/framework';
import type { RulesetInfo } from '../RulesetInfo';
import { Axes, Container, PassThroughInputManager, resolved } from '@osucad/framework';
import { Editor } from '../../editor/Editor';
import { RulesetKeyBindingContainer } from './RulesetKeyBindingContainer';

export class RulesetInputManager<T extends KeyBindingAction> extends PassThroughInputManager {
  @resolved(Editor, true)
  private editor?: Editor;

  override get allowRightClickFromLongTouch(): boolean {
    return !!this.editor;
  }

  readonly keyBindingContainer: KeyBindingContainer<T>;

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  constructor(ruleset: RulesetInfo, variant: number, unique: SimultaneousBindingMode) {
    super();

    this.internalChild = this.keyBindingContainer
      = this.createKeyBindingContainer(ruleset, variant, unique).with({
        child: this.#content = new Container({
          relativeSizeAxes: Axes.Both,
        }),
      });
  }

  createKeyBindingContainer(ruleset: RulesetInfo, variant: number, unique: SimultaneousBindingMode): KeyBindingContainer<T> {
    return new RulesetKeyBindingContainer(ruleset, variant, unique);
  }
}
