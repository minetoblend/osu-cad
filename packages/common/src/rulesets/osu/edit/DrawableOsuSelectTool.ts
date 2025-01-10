import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import type { HitSound } from '../../../hitsounds/HitSound';
import { getIcon } from '@osucad/resources';
import { Bindable, Direction, PlatformAction, resolved } from 'osucad-framework';
import { EditorAction } from '../../../editor/EditorAction';
import { DrawableComposeTool } from '../../../editor/screens/compose/DrawableComposeTool';
import { hasComboInformation } from '../../../hitObjects/IHasComboInformation';
import { Additions } from '../../../hitsounds/Additions';
import { TernaryState } from '../../../utils/TernaryState';
import { OsuHitObject } from '../hitObjects/OsuHitObject';
import { Slider } from '../hitObjects/Slider';
import { GlobalHitSoundState } from './GlobalHitSoundState';
import { GlobalNewComboBindable } from './GlobalNewComboBindable';
import { MobileControlButton } from './MobileEditorControls';
import { OsuHitObjectComposer } from './OsuHitObjectComposer';

export class DrawableOsuSelectTool extends DrawableComposeTool implements IKeyBindingHandler<PlatformAction | EditorAction> {
  @resolved(() => OsuHitObjectComposer)
  composer!: OsuHitObjectComposer;

  @resolved(GlobalNewComboBindable)
  newCombo!: GlobalNewComboBindable;

  @resolved(GlobalHitSoundState)
  hitSounds!: GlobalHitSoundState;

  whistleAddition = new Bindable(TernaryState.Indeterminate);
  finishAddition = new Bindable(TernaryState.Indeterminate);
  clapAddition = new Bindable(TernaryState.Indeterminate);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.whistleAddition.bindTo(this.hitSounds.whistle);
    this.finishAddition.bindTo(this.hitSounds.finish);
    this.clapAddition.bindTo(this.hitSounds.clap);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.newCombo.bindValueChanged(this.#applyNewCombo, this);

    this.whistleAddition.bindValueChanged(this.#applyHitSoundsToSelection, this);
    this.finishAddition.bindValueChanged(this.#applyHitSoundsToSelection, this);
    this.clapAddition.bindValueChanged(this.#applyHitSoundsToSelection, this);
  }

  #applyNewCombo() {
    console.log(TernaryState[this.newCombo.value]);

    if (this.newCombo.value === TernaryState.Indeterminate)
      return;

    for (const object of this.selection.selectedObjects) {
      if (hasComboInformation(object))
        object.newCombo = this.newCombo.value === TernaryState.Active;
    }

    this.commit();
  }

  override update() {
    super.update();

    this.#updateNewComboFromSelection();
    this.#updateHitSoundsFromSelection();
  }

  override createMobileControls(): Drawable[] {
    return [
      new MobileControlButton(getIcon('size-ew'), () => {
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Horizontal);
        this.commit();
      }),
      new MobileControlButton(getIcon('size-ns'), () => {
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Vertical);
        this.commit();
      }),
    ];
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof PlatformAction || binding instanceof EditorAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction | EditorAction>): boolean {
    if (e.repeat)
      return false;

    switch (e.pressed) {
      case PlatformAction.Delete:
      case PlatformAction.DeleteBackwardChar:
        for (const hitObject of [...this.selection.selectedObjects])
          this.hitObjects.remove(hitObject);
        this.commit();
        return true;
    }

    return false;
  }

  #updateNewComboFromSelection() {
    let newCombo: TernaryState | null = null;

    for (const hitObject of this.selection.selectedObjects) {
      if (!hasComboInformation(hitObject))
        continue;

      const state = hitObject.newCombo ? TernaryState.Active : TernaryState.Inactive;

      if (newCombo === null)
        newCombo = state;
      else if (state !== newCombo)
        newCombo = TernaryState.Indeterminate;
    }

    if (newCombo !== null)
      this.newCombo.value = newCombo;
  }

  #applyHitSoundsToSelection() {
    const updateAdditions = (addition: Additions, current: Additions) => {
      const bindable = this.hitSounds.getBindableForAddition(addition);
      if (bindable.value === TernaryState.Active)
        current |= addition;
      else if (bindable.value === TernaryState.Inactive)
        current &= ~addition;

      return current;
    };

    for (const hitObject of this.selection.selectedObjects) {
      if (!(hitObject instanceof OsuHitObject))
        continue;

      let additions = hitObject.hitSound.additions;

      additions = updateAdditions(Additions.Finish, additions);
      additions = updateAdditions(Additions.Whistle, additions);
      additions = updateAdditions(Additions.Clap, additions);

      if (additions !== hitObject.hitSound.additions)
        hitObject.hitSound = hitObject.hitSound.withAdditions(additions);
    }
  }

  #updateHitSoundsFromSelection() {
    let combinedAdditions: Additions | null = null;
    let mixedAdditions = Additions.None;

    for (const additions of this.#collectHitSounds(hs => hs.additions)) {
      if (combinedAdditions === null) {
        combinedAdditions = additions;
        continue;
      }

      mixedAdditions = mixedAdditions | (combinedAdditions ^ additions);
      combinedAdditions = combinedAdditions & additions;
    }

    if (combinedAdditions != null) {
      const updateAddition = (addition: Additions) => {
        const bindable = this.hitSounds.getBindableForAddition(addition);

        if (mixedAdditions & addition)
          bindable.value = TernaryState.Indeterminate;
        else
          bindable.value = (combinedAdditions & addition) ? TernaryState.Active : TernaryState.Inactive;
      };

      updateAddition(Additions.Whistle);
      updateAddition(Additions.Finish);
      updateAddition(Additions.Clap);
    }
  }

  * #collectHitSounds<T>(fn: (hitSound: HitSound) => T) {
    for (const hitObject of this.selection.selectedObjects) {
      if (!(hitObject instanceof OsuHitObject))
        continue;

      yield fn(hitObject.hitSound);

      if (hitObject instanceof Slider) {
        for (const hitSound of hitObject.hitSounds)
          yield fn(hitSound);
      }
    }
  }
}
