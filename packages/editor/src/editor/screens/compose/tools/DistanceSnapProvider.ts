import type { Slider } from '@osucad/common';
import { ControlPointInfo } from '@osucad/common';
import { CompositeDrawable, resolved } from 'osucad-framework';
import { EditorClock } from '../../../EditorClock';

export class DistanceSnapProvider
  extends CompositeDrawable {
  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  findSnappedDistance(referenceObject: Slider): number {
    const length = referenceObject!.path.calculatedDistance;
    const duration = Math.ceil(length / referenceObject!.sliderVelocity);
    let time = this.controlPointInfo.snap(
      // adding a tiny bit of length to make up for precision errors shortening the slider
      Math.ceil(referenceObject!.startTime + duration) + 1,
      this.editorClock.beatSnapDivisor.value,
      false,
    );

    if (time > referenceObject.startTime + duration) {
      const beatLength = this.controlPointInfo.timingPointAt(referenceObject.startTime).beatLength;

      time -= beatLength / this.editorClock.beatSnapDivisor.value;
    }

    return Math.max(0, referenceObject!.sliderVelocity * (time - referenceObject!.startTime));
  }
}
