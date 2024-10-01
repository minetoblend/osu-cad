import type { BeatmapDifficultyPatch } from '../../beatmap/BeatmapDifficultyInfo.ts';
import type { CommandContext } from './CommandContext.ts';
import type { CommandSource } from './CommandSource.ts';
import { EditorCommand } from './EditorCommand.ts';
import { PatchUtils } from './PatchUtils.ts';

export class UpdateDifficultyCommand extends EditorCommand {
  constructor(readonly patch: Partial<BeatmapDifficultyPatch>) {
    super();
  }

  apply(ctx: CommandContext, source: CommandSource): void {
    PatchUtils.applyPatch(this.patch, ctx.beatmap.difficulty);
  }

  createUndo(ctx: CommandContext): EditorCommand | null {
    return new UpdateDifficultyCommand(
      PatchUtils.createUndoPatch(this.patch, ctx.beatmap.difficulty),
    );
  }
}
