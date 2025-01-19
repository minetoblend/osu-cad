import type { HitObject, OperatorContext } from '@osucad/core';
import { Operator } from '@osucad/core';

export class DeleteOperator extends Operator {
  constructor(readonly hitObjects: HitObject[]) {
    super({
      title: 'Delete',
    });
  }

  override apply(context: OperatorContext<any>): void {
    for (const obj of this.hitObjects)
      context.beatmap.hitObjects.remove(obj);
  }
}
