import type { Bindable } from 'osucad-framework';
import type { IComposeTool } from './IComposeTool';
import { BindableBoolean, isMobile } from 'osucad-framework';

export class HitObjectComposerDependencies {
  constructor(
    readonly tools: IComposeTool[],
    readonly activeTool: Bindable<IComposeTool>,

  ) {
  }

  readonly autoAdvance = new BindableBoolean(isMobile.any);
}
