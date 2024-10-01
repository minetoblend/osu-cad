import type { ControlPointGroup, ControlPointGroupPatch } from '../../beatmap/timing/ControlPointGroup.ts';
import type { CommandContext } from './CommandContext.ts';
import type { CommandSource } from './CommandSource.ts';
import { EditorCommand } from './EditorCommand.ts';
import { PatchUtils } from './PatchUtils.ts';

export class UpdateControlPointCommand extends EditorCommand {
  constructor(
    controlPoint: ControlPointGroup | string,
    readonly patch: Partial<ControlPointGroupPatch>,
  ) {
    super();
    this.controlPointId = typeof controlPoint === 'string' ? controlPoint : controlPoint.id;
  }

  readonly controlPointId: string;

  apply(ctx: CommandContext, source: CommandSource): void {
    const controlPoint = ctx.controlPoints.getById(this.controlPointId);
    if (!controlPoint)
      return;

    controlPoint.applyPatch(this.patch, ctx);
  }

  createUndo(ctx: CommandContext): EditorCommand | null {
    const controlPoint = ctx.controlPoints.getById(this.controlPointId);
    if (!controlPoint)
      return null;

    const patch = this.patch;

    const undoPatch: Partial<ControlPointGroupPatch> = {};

    if (patch.time !== undefined)
      undoPatch.time = controlPoint.time;

    if (patch.timing !== undefined)
      undoPatch.timing = PatchUtils.createUndoPatchNullable(patch.timing, controlPoint.timing?.asPatch() ?? null);

    if (patch.sample !== undefined)
      undoPatch.sample = PatchUtils.createUndoPatchNullable(patch.sample, controlPoint.sample?.asPatch() ?? null);

    if (patch.effect !== undefined)
      undoPatch.effect = PatchUtils.createUndoPatchNullable(patch.effect, controlPoint.effect?.asPatch() ?? null);

    if (patch.difficulty !== undefined)
      undoPatch.difficulty = PatchUtils.createUndoPatchNullable(patch.difficulty, controlPoint.difficulty?.asPatch() ?? null);

    return new UpdateControlPointCommand(this.controlPointId, undoPatch);
  }
}
