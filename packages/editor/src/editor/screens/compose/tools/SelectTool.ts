import type { Texture } from 'pixi.js';
import { ComposeTool } from './ComposeTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { DrawableSelectTool } from './DrawableSelectTool';

export class SelectTool extends ComposeTool {
  get icon(): Texture {
    return useAsset('icon:select');
  }

  isSameTool(tool: ComposeTool): boolean {
    return tool instanceof SelectTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableSelectTool();
  }
}
