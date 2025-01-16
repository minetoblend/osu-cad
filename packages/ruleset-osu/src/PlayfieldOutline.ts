import { Axes, CompositeDrawable, RoundedBox } from '@osucad/framework';

export class PlayfieldOutline extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.addInternal(new RoundedBox({
      relativeSizeAxes: Axes.Both,
      fillAlpha: 0,
      cornerRadius: 1,
      outlines: [{
        width: 1,
        color: 0xFFFFFF,
      }],
    }));
  }
}
