import type { Texture } from 'pixi.js';
import type { ComposeTool } from './ComposeTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { getIcon } from '../../../../OsucadIcons';
import { DrawableBirdSliderTool } from './DrawableBirdSliderTool';
import { SliderPresetTool } from './SliderPresetTool';

export class BirdSliderTool extends SliderPresetTool {
  get icon(): Texture {
    return getIcon('slidershape-bird@2x');
  }

  isSameTool(): boolean {
    // always recreate tool
    return false;
  }

  isActive(tool: ComposeTool): boolean {
    return tool instanceof BirdSliderTool;
  }

  createDrawableTool(): DrawableComposeTool {
    return new DrawableBirdSliderTool();
  }
}
