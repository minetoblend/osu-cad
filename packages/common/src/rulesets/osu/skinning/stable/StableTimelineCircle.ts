import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { Axes, Bindable, CompositeDrawable, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { ISkinSource } from '../../../../skinning/ISkinSource';

export class StableTimelineCircle extends CompositeDrawable {
  constructor() {
    super();
  }

  @resolved(ISkinSource)
  skin!: ISkinSource;

  accentColor = new Bindable(new Color(0xFFFFFF));

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.baseWidth;

    this.relativeSizeAxes = Axes.Both;
    this.addAllInternal(

    );
  }
}
