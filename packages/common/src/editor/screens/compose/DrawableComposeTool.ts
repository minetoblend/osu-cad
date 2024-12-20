import { Axes, CompositeDrawable, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { UpdateHandler } from '../../../crdt/UpdateHandler';
import { Playfield } from '../../../rulesets/ui/Playfield';

export class DrawableComposeTool extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(IBeatmap)
  protected beatmap!: IBeatmap;

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  @resolved(Playfield)
  protected playfield!: Playfield;

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
