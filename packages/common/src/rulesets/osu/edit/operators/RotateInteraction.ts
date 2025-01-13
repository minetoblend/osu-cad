import type { KeyDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { Axes, CompositeDrawable, Key, resolved, Vec2 } from 'osucad-framework';
import { HitObjectComposer } from '../../../../editor/screens/compose/HitObjectComposer';
import { RotateGizmo } from '../../../../userInterface/gizmos/RotateGizmo';
import { RotateOperator } from './RotateOperator';

export class RotateInteraction extends CompositeDrawable {
  constructor(readonly hitObjects: OsuHitObject[]) {
    super();

    this.operator = new RotateOperator(this.hitObjects);
    this.operator.expandByDefault = true;
  }

  readonly operator: RotateOperator;

  @resolved(HitObjectComposer)
  composer!: HitObjectComposer;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    const operator = this.operator;

    const gizmo = this.internalChild = new RotateGizmo(100);
    operator.selectionCenter.bindable.bindValueChanged(useCenter =>
      gizmo.position = useCenter.value ? operator.center : new Vec2(256, 192), true);

    gizmo.angle.bindValueChanged(angle => operator.angle.value = angle.value * 180 / Math.PI);
    operator.angle.bindable.bindValueChanged(angle => gizmo.angle.value = angle.value / 180 * Math.PI);

    operator.ended.addListener(() => {
      this.expire();
    });

    this.composer.beginOperator(operator);
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.composer.cancelOperator(this.operator);
      return true;
    }

    if (e.key === Key.Enter) {
      this.composer.completeOperator(this.operator);
      return true;
    }

    return false;
  }
}
