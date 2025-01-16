import { Axes, Bindable, Box, EasingFunction } from '@osucad/framework';
import { Color } from 'pixi.js';

export class ArgonHoldNoteHittingLayer extends Box {
  readonly isHitting = new Bindable(false);
  readonly accentColor = new Bindable(new Color(0xFFFFFF));

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.blendMode = 'add';
    this.alpha = 0;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor.bindValueChanged((color) => {
      this.color = new Color(color.value).setAlpha(0.3);
    }, true);

    this.isHitting.bindValueChanged((isHitting) => {
      const animation_length = 80;

      this.clearTransforms();

      if (isHitting.value) {
        this.fadeTo(1, animation_length, EasingFunction.OutSine)
          .fadeTo(0.5, animation_length, EasingFunction.OutSine);
        // TODO: impleement loops
      }
      else {
        this.fadeOut(0.5);
      }
    }, true);
  }

  recycle() {
    this.clearTransforms();
    this.alpha = 0;
  }
}
