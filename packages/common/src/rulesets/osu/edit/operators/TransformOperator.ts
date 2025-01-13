import type { Matrix } from 'pixi.js';
import type { OperatorOptions } from '../../../../editor/screens/compose/operators/Operator';
import type { OperatorContext } from '../../../../editor/screens/compose/operators/OperatorContext';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { resolved, Vec2 } from 'osucad-framework';
import { EditorClock } from '../../../../editor/EditorClock';
import { Operator } from '../../../../editor/screens/compose/operators/Operator';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Slider } from '../../hitObjects/Slider';
import { Spinner } from '../../hitObjects/Spinner';

export abstract class TransformOperator extends Operator<OsuHitObject> {
  protected constructor(options: OperatorOptions, hitObjects: OsuHitObject[]) {
    super(options);
    this.hitObjects = hitObjects.filter(it => !(it instanceof Spinner));

    this.center = this.#calculateCenter(this.hitObjects);
  }

  readonly hitObjects: OsuHitObject[];

  readonly center: Vec2;

  #calculateCenter(hitObjects: OsuHitObject[]) {
    let min = hitObjects[0].position;
    let max = hitObjects[0].position;

    for (const hitObject of hitObjects) {
      min = min.componentMin(hitObject.position);
      max = max.componentMax(hitObject.position);

      if (hitObject instanceof Slider) {
        const endPosition = hitObject.position.add(hitObject.path.endPosition);

        min = min.componentMin(endPosition);
        max = max.componentMax(endPosition);
      }
    }

    return min.addInPlace(max).scaleInPlace(0.5);
  }

  override apply(context: OperatorContext<OsuHitObject>) {
    const transform = this.getMatrix();

    for (const hitObject of this.hitObjects)
      this.#transform(hitObject, transform, context);
  }

  protected get recalculateSliderLength() {
    return true;
  }

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  #transform(hitObject: OsuHitObject, transform: Matrix, context: OperatorContext<OsuHitObject>) {
    if (!(hitObject instanceof HitCircle || hitObject instanceof Slider))
      return;

    const position = hitObject.position;
    hitObject.position = Vec2.from(transform.apply(position));

    if (hitObject instanceof Slider) {
      const pointTransform = transform
        .clone()
        .translate(-transform.tx, -transform.ty);

      hitObject.controlPoints = hitObject.path.controlPoints.map(p => p.transformBy(pointTransform));

      if (this.recalculateSliderLength)
        hitObject.snapLength(context.beatmap.controlPoints, this.editorClock.beatSnapDivisor.value);
    }
  }

  protected abstract getMatrix(): Matrix;
}
