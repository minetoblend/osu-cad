import type { Texture } from 'pixi.js';
import type { IKeyBindingHandler, KeyBindingPressEvent, KeyBindingReleaseEvent } from 'osucad-framework';
import { dependencyLoader, resolved } from 'osucad-framework';
import { EditorAction } from '../../EditorAction';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import type { Additions } from '../../../beatmap/hitSounds/Additions';
import { additionToSampleType } from '../../../beatmap/hitSounds/SampleType';
import { ADDITIONS } from '../../InjectionTokens';
import type { AdditionsBindable } from '../../../beatmap/hitSounds/AdditionsBindable';
import { ComposeToggleButton } from './ComposeToggleButton';
import { SampleHighlightContainer } from './SampleHighlightContainer';

export class AdditionToggleButton extends ComposeToggleButton
  implements IKeyBindingHandler<EditorAction> {
  constructor(
    icon: Texture,
    readonly addition: Additions,
    readonly keyBinding: EditorAction,
  ) {
    super(icon);
  }

  @resolved(HitsoundPlayer)
  hitsoundPlayer!: HitsoundPlayer;

  @resolved(ADDITIONS)
  protected activeAdditions!: AdditionsBindable;

  @dependencyLoader()
  load() {
    this.addInternal(
      new SampleHighlightContainer(additionToSampleType(this.addition)).with({
        depth: 1,
      }),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.activeAdditions.valueChanged.addListener(this.#additionsChanged, this);
  }

  #additionsChanged() {
    this.active.value = this.activeAdditions.has(this.addition);
  }

  protected onActivate() {
    super.onActivate();

    this.activeAdditions.add(this.addition);
  }

  protected onDeactivate() {
    super.onDeactivate();

    this.activeAdditions.remove(this.addition);
  }

  dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding instanceof EditorAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === this.keyBinding) {
      this.triggerAction();
      this.armed = true;

      return true;
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<EditorAction>) {
    if (e.pressed === this.keyBinding)
      this.armed = false;
  }
}
