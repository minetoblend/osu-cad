import type { ColorSource } from 'pixi.js';
import type { EffectPoint } from '../../../../controlPoints/EffectPoint';
import { almostEquals } from '../../../../../../framework/src/utils/almostEquals';
import { ControlPointPlacementBlueprint } from '../ControlPointPlacementBlueprint';

export class KiaiPlacementBlueprint extends ControlPointPlacementBlueprint<EffectPoint> {
  constructor() {
    super();
  }

  protected override get layerColor(): ColorSource {
    return 0x6AF878;
  }

  #startPoint?: EffectPoint;

  #isPlacingGap = false;

  #wasSameTime = false;

  protected override createInstance(): EffectPoint {
    const point = this.controlPointInfo.effectPointAt(this.timeAtMousePosition).deepClone();

    point.time = this.timeAtMousePosition;

    this.#startPoint = point.deepClone();
    this.#startPoint!.kiaiMode = !this.#startPoint!.kiaiMode;

    this.#isPlacingGap = point.kiaiMode;

    this.#wasSameTime = false;

    return point;
  }

  protected override updateControlPoint(controlPoint: EffectPoint) {
    super.updateControlPoint(controlPoint);
    if (!this.#startPoint)
      return;

    const isSameTime = almostEquals(this.#startPoint.time, controlPoint.time);
    const wasSameTime = this.#wasSameTime;
    this.#wasSameTime = isSameTime;

    if (isSameTime) {
      if (!wasSameTime)
        this.controlPointInfo.remove(this.#startPoint);

      controlPoint.kiaiMode = !this.#isPlacingGap;
      return;
    }

    if (!isSameTime && wasSameTime)
      this.controlPointInfo.add(this.#startPoint);

    if (!isSameTime) {
      if (controlPoint.time < this.#startPoint.time) {
        this.#startPoint.kiaiMode = this.#isPlacingGap;
        controlPoint.kiaiMode = !this.#isPlacingGap;
      }
      else {
        this.#startPoint.kiaiMode = !this.#isPlacingGap;
        controlPoint.kiaiMode = this.#isPlacingGap;
      }
    }
  }

  protected override onPlacementEnd(controlPoint: EffectPoint) {
    super.onPlacementEnd(controlPoint);

    const startPoint = this.#startPoint;

    if (startPoint) {
      if (almostEquals(startPoint.time, controlPoint.time, 1)) {
        this.schedule(() => {
          this.controlPointInfo.remove(startPoint);
        });
      }

      this.#startPoint = undefined;
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    if (this.#startPoint)
      this.controlPointInfo.remove(this.#startPoint);
  }
}
