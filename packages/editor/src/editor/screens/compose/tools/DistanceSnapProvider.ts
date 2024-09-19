import type { Slider } from '../../../../beatmap/hitObjects/Slider';
import { CompositeDrawable, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../../beatmap/timing/ControlPointInfo';
import { EditorClock } from '../../../EditorClock';

export class DistanceSnapProvider
  extends CompositeDrawable {
  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  findSnappedDistance(referenceObject: Slider): number {
    const length = referenceObject!.path.calculatedDistance;
    const duration = length / referenceObject!.velocity;
    let time = this.controlPointInfo.snap(
      // adding a tiny bit of length to make up for precision errors shortening the slider
      referenceObject!.startTime + duration * 1.01,
      this.editorClock.beatSnapDivisor.value,
    );

    if (time > referenceObject.startTime + duration) {
      const beatLength = this.controlPointInfo.timingPointAt(referenceObject.startTime).beatLength;

      time -= beatLength / this.editorClock.beatSnapDivisor.value;
    }

    return Math.max(0, referenceObject!.velocity * (time - referenceObject!.startTime));
  }
}
