import type { IComposeTool } from '../../../editor/screens/compose/IComposeTool';
import { dependencyLoader } from 'osucad-framework';
import { HitObjectComposer } from '../../../editor/screens/compose/HitObjectComposer';
import { PlayfieldOutline } from '../PlayfieldOutline';
import { OsuSelectTool } from './OsuSelectTool';

export class OsuHitObjectComposer extends HitObjectComposer {
  protected override getTools(): IComposeTool[] {
    return [
      new OsuSelectTool(),
    ];
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.drawableRuleset.playfield.add(new PlayfieldOutline().with({
      depth: 1,
    }));
  }
}
