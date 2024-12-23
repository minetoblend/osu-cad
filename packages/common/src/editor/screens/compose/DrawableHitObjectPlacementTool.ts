import type { HitObject } from '../../../hitObjects/HitObject';
import { almostEquals } from 'osucad-framework';
import { DrawableComposeTool } from './DrawableComposeTool';

export abstract class DrawableHitObjectPlacementTool<T extends HitObject> extends DrawableComposeTool {
  protected abstract createHitObject(): T;

  hitObject!: T;

  protected get removeHitObjectsAtCurrentTime() {
    return true;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.selection.clear();

    this.hitObject = this.createHitObject();
    this.hitObject.synthetic = true;

    this.hitObjects.addUntracked(this.hitObject);
  }

  protected isPlacing = false;

  protected beginPlacement() {
    this.selection.clear();

    this.isPlacing = true;

    this.hitObjects.removeUntracked(this.hitObject);

    this.hitObject.synthetic = false;

    if (this.removeHitObjectsAtCurrentTime) {
      const hitObjectsAtTime = this.hitObjects.items
        .filter(it => almostEquals(it.startTime, this.hitObject.startTime));

      for (const h of hitObjectsAtTime)
        this.hitObjects.remove(h);
    }

    this.hitObjects.add(this.hitObject);
    this.playfield.updateSubTree();
  }

  protected endPlacement() {
    this.commit();

    this.hitObject = this.createHitObject();

    this.hitObject.synthetic = true;

    this.hitObjects.addUntracked(this.hitObject);

    this.isPlacing = false;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    if (!this.isPlacing)
      this.hitObjects.removeUntracked(this.hitObject);
    else
      this.commit();
  }
}
