import { OsuSelectionBlueprintContainer } from '../../../../rulesets/osu/edit/selection/OsuSelectionBlueprintContainer';
import { DrawableModdingTool } from './DrawableModdingTool';

export class DrawableModdingSelectTool extends DrawableModdingTool {
  constructor() {
    super();

    this.addInternal(new OsuSelectionBlueprintContainer().adjust(it => it.readonly = true));
  }
}
