import type { Drawable, InputManager, Vec2 } from '@osucad/framework';
import type { ToolModifier } from './ToolModifier';
import { Action, Axes, CompositeDrawable, Container, EmptyDrawable, isSourcedFromTouch, resolved } from '@osucad/framework';
import { UpdateHandler } from '@osucad/multiplayer';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { Playfield } from '../../../rulesets/ui/Playfield';
import { EditorBeatmap } from '../../EditorBeatmap';
import { EditorClock } from '../../EditorClock';
import { HitObjectSelectionManager } from './HitObjectSelectionManager';

export class DrawableComposeTool extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected inputManager!: InputManager;

  @resolved(IBeatmap)
  protected beatmap!: IBeatmap;

  @resolved(EditorBeatmap)
  protected editorBeatmap!: EditorBeatmap;

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  @resolved(Playfield)
  protected playfield!: Playfield;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(HitObjectSelectionManager)
  protected selection!: HitObjectSelectionManager;

  readonly playfieldOverlay = new Container({
    relativeSizeAxes: Axes.Both,
  });

  modifiersChanged = new Action();

  getModifiers(): ToolModifier[] {
    return [];
  }

  protected updateModifiers() {
    this.modifiersChanged.emit();
  }

  screenSpaceToPlayfieldPosition(screenSpacePosition: Vec2) {
    return this.playfield.toLocalSpace(screenSpacePosition);
  }

  playfieldToScreenSpacePosition(position: Vec2) {
    return this.playfield.toScreenSpace(position);
  }

  protected get beatDivisor() {
    return this.editorClock.beatSnapDivisor.value;
  }

  protected get lastInputWasTouch() {
    return isSourcedFromTouch(this.inputManager.currentState.mouse.lastSource);
  }

  createSettings(): Drawable {
    return new EmptyDrawable();
  }

  createMobileControls(): Drawable[] {
    return [];
  }

  protected override loadComplete() {
    super.loadComplete();

    this.inputManager = this.getContainingInputManager()!;
  }

  protected get playfieldMousePosition() {
    return this.screenSpaceToPlayfieldPosition(this.inputManager.currentState.mouse.position);
  }

  protected get hitObjects() {
    return this.beatmap.hitObjects;
  }

  protected get controlPointInfo() {
    return this.beatmap.controlPoints;
  }

  protected commit() {
    this.updateHandler.commit();
  }

  protected undoCurrentTransaction() {
    this.updateHandler.undoCurrentTransaction();
  }
}
