import type { Texture } from 'pixi.js';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { ComposeTool } from './ComposeTool';
import { DrawableSpinnerTool } from './DrawableSpinnerTool';

export class SpinnerTool extends ComposeTool {
  get icon(): Texture {
    return getIcon('spinner');
  }

  isSameTool(tool: ComposeTool): boolean {
    return tool instanceof SpinnerTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableSpinnerTool();
  }
}
