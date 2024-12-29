import type { CommandContext } from './CommandContext';
import type { CommandSource } from './CommandSource';
import { CreateControlPointCommand } from './CreateControlPointCommand';
import { EditorCommand } from './EditorCommand';

export class DeleteControlPointCommand extends EditorCommand {
  constructor(
    readonly id: string,
  ) {
    super();
  }

  apply(ctx: CommandContext, source: CommandSource): void {
    const controlPoint = ctx.controlPoints.getById(this.id);
    if (!controlPoint)
      return;

    ctx.controlPoints.remove(controlPoint);
  }

  createUndo(ctx: CommandContext): EditorCommand | null {
    const controlPoint = ctx.controlPoints.getById(this.id);
    if (!controlPoint)
      return null;

    return new CreateControlPointCommand({
      id: controlPoint.id,
      time: controlPoint.time,
      timing: controlPoint.timing?.asPatch(),
      sample: controlPoint.sample?.asPatch(),
      effect: controlPoint.effect?.asPatch(),
      difficulty: controlPoint.difficulty?.asPatch(),
    });
  }
}
