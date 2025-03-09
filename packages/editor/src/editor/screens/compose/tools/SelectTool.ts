import type { Texture } from 'pixi.js';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { ComposeTool } from './ComposeTool';
import { DrawableSelectTool } from './DrawableSelectTool';

export class SelectTool extends ComposeTool {
  get icon(): Texture {
    return getIcon('diamond-sword');
  }

  isSameTool(tool: ComposeTool): boolean {
    return tool instanceof SelectTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableSelectTool();
  }
}
