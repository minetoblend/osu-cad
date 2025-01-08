import type { IComposeTool } from '@osucad/common';
import { HitObjectComposer } from '@osucad/common';
import { ManiaSelectTool } from './ManiaSelectTool';

export class ManiaHitObjectComposer extends HitObjectComposer {
  protected override getTools(): IComposeTool[] {
    return [
      new ManiaSelectTool(),
    ];
  }
}
