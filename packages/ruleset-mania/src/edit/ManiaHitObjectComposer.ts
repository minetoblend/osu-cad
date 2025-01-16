import type { IComposeTool } from '@osucad/core';
import { HitObjectComposer } from '@osucad/core';
import { ManiaSelectTool } from './ManiaSelectTool';

export class ManiaHitObjectComposer extends HitObjectComposer {
  protected override getTools(): IComposeTool[] {
    return [
      new ManiaSelectTool(),
    ];
  }
}
