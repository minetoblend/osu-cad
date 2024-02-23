import { ComposeTool } from './ComposeTool.ts';
import { EditorCommand, Spinner, updateHitObject } from '@osucad/common';
import { FederatedPointerEvent } from 'pixi.js';

export class SpinnerTool extends ComposeTool {
  private placingObject?: Spinner;

  protected onMouseDown(evt: FederatedPointerEvent) {
    if (evt.button === 0 && !this.placingObject) {
      const time = this.editor.clock.currentTime;

      const spinner = new Spinner();
      spinner.startTime = time;
      spinner.duration = this.getDuration(spinner);

      this.submit(
        EditorCommand.createHitObject({
          hitObject: spinner.serialize(),
        }),
      );

      this.placingObject = this.editor.beatmapManager.hitObjects.getById(
        spinner.id,
      ) as Spinner;

      console.log(this.placingObject);
    }

    if (evt.button === 2 && this.placingObject) {
      this.submit(
        updateHitObject(this.placingObject, {
          duration: Math.max(
            this.editor.clock.currentTime - this.placingObject.startTime,
            this.editor.beatmapManager.controlPoints.timingPointAt(
              this.editor.clock.currentTime,
            ).timing.beatLength / this.beatInfo.beatSnap,
          ),
        }),
      );

      this.placingObject = undefined;
      this.editor.commandManager.commit();
    }
  }

  getDuration(spinner: Spinner) {
    const timingPoint = this.editor.beatmapManager.controlPoints.timingPointAt(
      this.editor.clock.currentTime,
    );
    const endTime =
      this.editor.beatmapManager.controlPoints.snap(
        this.editor.clock.currentTime,
        this.beatInfo.beatSnap,
      ) + timingPoint.timing.beatLength;
    return Math.max(
      endTime - spinner.startTime,
      timingPoint.timing.beatLength / this.beatInfo.beatSnap,
    );
  }

  onTick() {
    super.onTick();
    if (this.placingObject) {
      console.log(this.getDuration(this.placingObject));
      this.submit(
        updateHitObject(this.placingObject, {
          duration: this.getDuration(this.placingObject),
        }),
      );
    }
  }
}
