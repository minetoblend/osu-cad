import { CompositeDrawable, resolved } from 'osucad-framework';
import { EditorClock } from '../../../EditorClock';
import { ControlPointInfo } from '../../../../beatmap/timing/ControlPointInfo';
import type { Slider } from '../../../../beatmap/hitObjects/Slider';

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
      referenceObject!.startTime + duration,
      this.editorClock.beatSnapDivisor.value,
    );

    if (time > referenceObject.startTime + duration) {
      const beatLength = this.controlPointInfo.timingPointAt(referenceObject.startTime).beatLength;

      time -= beatLength / this.editorClock.beatSnapDivisor.value;
    }

    return referenceObject!.velocity * (time - referenceObject!.startTime);
  }
}
