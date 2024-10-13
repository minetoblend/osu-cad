import type { BeatmapDifficultyPatch } from '../../beatmap/BeatmapDifficultyInfo';
import type { CommandContext } from './CommandContext';
import type { CommandSource } from './CommandSource';
import { EditorCommand } from './EditorCommand';
import { PatchUtils } from './PatchUtils';

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
