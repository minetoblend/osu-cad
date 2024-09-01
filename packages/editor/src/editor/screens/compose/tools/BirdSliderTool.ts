import type { Texture } from 'pixi.js';
import { getIcon } from '../../../../OsucadIcons';
import type { ComposeTool } from './ComposeTool';
import type { DrawableComposeTool } from './DrawableComposeTool';
import { SliderPresetTool } from './SliderPresetTool';
import { DrawableBirdSliderTool } from './DrawableBirdSliderTool';

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
