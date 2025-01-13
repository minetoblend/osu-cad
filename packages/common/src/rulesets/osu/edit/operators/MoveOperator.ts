import { Vec2 } from 'osucad-framework';
import { Operator } from '../../../../editor/screens/compose/operators/Operator';
import { Vec2OperatorProperty } from '../../../../editor/screens/compose/operators/properties/Vec2OperatorProperty';

export class MoveOperator extends Operator {
  constructor() {
    super({
      title: 'Move',
    });
  }

  readonly delta = new Vec2OperatorProperty({
    title: 'Move',
    defaultValue: new Vec2(0),
  });

  override apply(): void {
  }
}
