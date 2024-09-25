import type { IKeyBindingHandler, KeyBindingPressEvent, KeyBindingReleaseEvent } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { HitSoundState } from '../../../beatmap/hitSounds/BindableHitSound';
import { dependencyLoader, resolved } from 'osucad-framework';
import { Additions } from '../../../beatmap/hitSounds/Additions';
import { additionToSampleType, SampleType } from '../../../beatmap/hitSounds/SampleType';
import { EditorAction } from '../../EditorAction';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import { HITSOUND } from '../../InjectionTokens';
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

  @resolved(HITSOUND)
  protected hitSoundState!: HitSoundState;

  @dependencyLoader()
  load() {
    this.addInternal(
      new SampleHighlightContainer(this.addition === Additions.Whistle
        ? [
            SampleType.Whistle,
            SampleType.SliderWhistle,
          ]
        : additionToSampleType(this.addition)),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.hitSoundState.additionsBindable.valueChanged.addListener(this.#additionsChanged, this);
  }

  #additionsChanged() {
    this.active.value = this.hitSoundState.hasAdditions(this.addition);
  }

  protected onActivate() {
    super.onActivate();

    this.hitSoundState.setAdditions(this.hitSoundState.additions | this.addition);
  }

  protected onDeactivate() {
    super.onDeactivate();

    this.hitSoundState.setAdditions(this.hitSoundState.additions & ~this.addition);
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
