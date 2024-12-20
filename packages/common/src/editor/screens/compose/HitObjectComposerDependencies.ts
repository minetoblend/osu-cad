import type { Bindable } from 'osucad-framework';
import type { IComposeTool } from './IComposeTool';

export class HitObjectComposerDependencies {
  constructor(
    readonly tools: IComposeTool[],
    readonly activeTool: Bindable<IComposeTool>,
  ) {
  }
}
