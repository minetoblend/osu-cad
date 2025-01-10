import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import { getIcon } from '@osucad/resources';
import { Direction, PlatformAction, resolved } from 'osucad-framework';
import { EditorAction } from '../../../editor/EditorAction';
import { DrawableComposeTool } from '../../../editor/screens/compose/DrawableComposeTool';
import { hasComboInformation } from '../../../hitObjects/IHasComboInformation';
import { TernaryState } from '../../../utils/TernaryState';
import { GlobalNewComboBindable } from './GlobalNewComboBindable';
import { MobileControlButton } from './MobileEditorControls';
import { OsuHitObjectComposer } from './OsuHitObjectComposer';

export class DrawableOsuSelectTool extends DrawableComposeTool implements IKeyBindingHandler<PlatformAction | EditorAction> {
  @resolved(() => OsuHitObjectComposer)
  composer!: OsuHitObjectComposer;

  @resolved(GlobalNewComboBindable)
  newCombo!: GlobalNewComboBindable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.newCombo.bindValueChanged(this.#applyNewCombo, this);
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

  override update() {
    super.update();

    this.#updateNewComboFromSelection();
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
}
