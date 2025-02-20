import type { IComposeTool } from '@osucad/core';
import type { Drawable } from '@osucad/framework';
import { HitObjectComposer } from '@osucad/core';
import { EmptyDrawable } from '@osucad/framework';
import { ManiaSelectTool } from './ManiaSelectTool';

export class ManiaHitObjectComposer extends HitObjectComposer {
  protected override createTopBar(): Drawable {
    return new EmptyDrawable();
  }

  protected override getTools(): IComposeTool[] {
    return [
      new ManiaSelectTool(),
    ];
  }
}
