import { resolved } from 'osucad-framework';
import { DrawableComposeTool } from '../../compose/DrawableComposeTool';
import { ModdingComposer } from '../ModdingComposer';
import { ModPost } from '../objects/ModPost';

export class DrawableModdingTool extends DrawableComposeTool {
  @resolved(ModPost)
  protected modPost!: ModPost;

  @resolved(() => ModdingComposer)
  protected composer!: ModdingComposer;
}
