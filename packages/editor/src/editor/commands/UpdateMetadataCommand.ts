import type { BeatmapMetadataPatch } from '../../beatmap/BeatmapMetadata.ts';
import type { CommandContext } from './CommandContext.ts';
import type { CommandSource } from './CommandSource.ts';
import { EditorCommand } from './EditorCommand.ts';
import { PatchUtils } from './PatchUtils.ts';

export class UpdateMetadataCommand extends EditorCommand {
  constructor(readonly patch: Partial<BeatmapMetadataPatch>) {
    super();
  }

  apply(ctx: CommandContext, source: CommandSource): void {
    ctx.beatmap.metadata.applyPatch(this.patch, ctx);
  }

  createUndo(ctx: CommandContext): EditorCommand | null {
    return new UpdateMetadataCommand(PatchUtils.createUndoPatch(this.patch, ctx.beatmap.metadata));
  }
}
