import {registerOperator} from "./operatorRegistry.ts";
import {Operator, OperatorContext} from "./operator.ts";
import {updateHitObject, Vec2} from "@osucad/common";
import "reflect-metadata"
import {Vec2Parameter} from "./parameter.ts";


@registerOperator({
  id: "hitobjects.move",
  label: "Move Hit Objects",
})
export class MoveHitObjectsOperator extends Operator {
  move = new Vec2Parameter({label: "Move", value: new Vec2(0, 0)});

  constructor() {
    super({ label: 'Move Objects' });
  }

  execute(ctx: OperatorContext): boolean {
    for (const object of ctx.editor.selection.selectedObjects) {
      ctx.editor.commandManager.submit(updateHitObject(object, {
        position: object.position.add(this.move.value),
      }));
    }
    return true;
  }
}