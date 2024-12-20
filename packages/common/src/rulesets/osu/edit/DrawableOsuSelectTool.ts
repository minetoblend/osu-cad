import { dependencyLoader } from 'osucad-framework';
import { DrawableComposeTool } from '../../../editor/screens/compose/DrawableComposeTool';
import { OsuSelectBox } from './OsuSelectBox';

export class DrawableOsuSelectTool extends DrawableComposeTool {
  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(new OsuSelectBox());
  }
}
