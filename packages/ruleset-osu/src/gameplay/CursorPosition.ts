import { Vec2 } from "@osucad/framework";
import type { DynamicsParameters } from "./SecondOrderDynamics";
import { SecondOrderDynamics } from "./SecondOrderDynamics";


export class CursorPosition
{
  cursorX = new SecondOrderDynamics(0, {
    frequency: 1,
    damping: 1,
    response: 1,
  });
  cursorY = new SecondOrderDynamics(0, {
    frequency: 1,
    damping: 1,
    response: 1,
  });


  update(target: Vec2, dt: number, parameters: DynamicsParameters)
  {
    dt /= 1000;

    this.cursorX.setParameters(parameters);
    this.cursorY.setParameters(parameters);

    return new Vec2(
        this.cursorX.update(dt, target.x),
        this.cursorY.update(dt, target.y),
    );
  }

  get current()
  {
    return new Vec2(this.cursorX.current, this.cursorY.current);
  }

  get velocity()
  {
    return new Vec2(this.cursorX.velocity, this.cursorY.velocity);
  }
}
