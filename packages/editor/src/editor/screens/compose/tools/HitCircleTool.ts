import type { Texture } from 'pixi.js';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { ComposeTool } from './ComposeTool';
import { DrawableHitCircleTool } from './DrawableHitCircleTool';

export class HitCircleTool extends ComposeTool {
  get icon(): Texture {
    return getIcon('circle');
  }

  isSameTool(tool: ComposeTool): boolean {
    return tool instanceof HitCircleTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableHitCircleTool();
  }
}
