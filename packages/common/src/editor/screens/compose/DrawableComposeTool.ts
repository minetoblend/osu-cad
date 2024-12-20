import type { InputManager } from 'osucad-framework';
import { Axes, CompositeDrawable, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { UpdateHandler } from '../../../crdt/UpdateHandler';
import { Playfield } from '../../../rulesets/ui/Playfield';
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

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  @resolved(Playfield)
  protected playfield!: Playfield;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(HitObjectSelectionManager)
  protected selection!: HitObjectSelectionManager;

  protected override loadComplete() {
    super.loadComplete();

    this.inputManager = this.getContainingInputManager()!;
  }

  protected get mousePosition() {
    return this.toLocalSpace(this.inputManager.currentState.mouse.position);
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
