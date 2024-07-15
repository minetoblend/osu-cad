import type {
  IDistanceSnapProvider,
  Slider,
} from '@osucad/common';
import {
  ControlPointManager,
} from '@osucad/common';
import { CompositeDrawable, resolved } from 'osucad-framework';
import { EditorClock } from '../../../EditorClock';

export class DistanceSnapProvider
  extends CompositeDrawable
  implements IDistanceSnapProvider {
  @resolved(ControlPointManager)
  controlPointInfo!: ControlPointManager;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  findSnappedDistance(referenceObject: Slider): number {
    const length = referenceObject!.path.totalLength;
    const duration = length / referenceObject!.velocity;
    let time = this.controlPointInfo.snap(
      referenceObject!.startTime + duration,
      this.editorClock.beatSnapDivisor.value,
    );

    if (time > referenceObject.startTime + duration) {
      const beatLength = this.controlPointInfo.timingPointAt(
        referenceObject.startTime,
      ).timing.beatLength;

      time -= beatLength / this.editorClock.beatSnapDivisor.value;
    }

    return referenceObject!.velocity * (time - referenceObject!.startTime);
  }
}
