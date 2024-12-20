import type { MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import { almostEquals, MouseButton } from 'osucad-framework';
import { DrawableComposeTool } from '../../../editor/screens/compose/DrawableComposeTool';
import { HitCircle } from '../hitObjects/HitCircle';

export class DrawableHitCirclePlacementTool extends DrawableComposeTool {
  hitObject = new HitCircle();

  protected override loadComplete() {
    super.loadComplete();

    this.hitObjects.addUntracked(this.hitObject);
  }

  override update() {
    super.update();

    this.hitObject.position = this.mousePosition;
    this.hitObject.startTime = this.editorClock.currentTime;
  }

  #isPlacing = false;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#isPlacing = true;
      this.hitObjects.removeUntracked(this.hitObject);

      const hitObjectsAtTime = this.hitObjects.items
        .filter(it => almostEquals(it.startTime, this.hitObject.startTime));

      for (const h of hitObjectsAtTime)
        this.hitObjects.remove(h);

      this.hitObjects.add(this.hitObject);
      this.playfield.updateSubTree();
    }
    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.commit();

      this.hitObject = new HitCircle();

      this.hitObjects.addUntracked(this.hitObject);
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.hitObjects.removeUntracked(this.hitObject);
  }
}
