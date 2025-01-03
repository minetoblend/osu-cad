import { resolved } from 'osucad-framework';
import { DrawableComposeTool } from '../../compose/DrawableComposeTool';
import { ModdingComposer } from '../ModdingComposer';
import { ModdingScreenSnappingProvider } from '../ModdingScreenSnappingProvider';
import { ModPost } from '../objects/ModPost';

export class DrawableModdingTool extends DrawableComposeTool {
  @resolved(ModPost)
  protected modPost!: ModPost;

  @resolved(() => ModdingComposer)
  protected composer!: ModdingComposer;

  @resolved(ModdingScreenSnappingProvider)
  protected snapping!: ModdingScreenSnappingProvider;
}
