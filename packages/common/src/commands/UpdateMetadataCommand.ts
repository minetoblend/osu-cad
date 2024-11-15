import type { BeatmapMetadataPatch } from '../beatmap/BeatmapMetadata';
import type { CommandContext } from './CommandContext';
import type { CommandSource } from './CommandSource';
import { EditorCommand } from './EditorCommand';
import { PatchUtils } from './PatchUtils';

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
