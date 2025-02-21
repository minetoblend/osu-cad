import type { ColorSource } from 'pixi.js';
import { ColorUtils } from '@osucad/framework';
import { DrawableSliderPath } from '../../hitObjects/drawables/DrawableSliderPath';
import { PlaySliderBody } from '../../hitObjects/drawables/PlaySliderBody';
import { ArgonMainCirclePiece } from './ArgonMainCirclePiece';

export class ArgonSliderBody extends PlaySliderBody {
  constructor() {
    super();
  }

  protected override loadComplete() {
    const path_radius = ArgonMainCirclePiece.OUTER_GRADIENT_SIZE / 2;

    super.loadComplete();

    this.accentColorBindable.bindValueChanged(accent => this.borderColor = accent.value, true);
    this.scaleBindable.bindValueChanged(scale => this.pathRadius = path_radius * scale.value, true);

    // This border size thing is kind of weird, hey.
    const intended_thickness = ArgonMainCirclePiece.GRADIENT_THICKNESS / path_radius;

    this.borderSize = intended_thickness / DrawableSliderPath.BORDER_PORTION;
  }

  protected override createSliderPath(): DrawableSliderPath {
    return new ArgonDrawableSliderPath();
  }
}

class ArgonDrawableSliderPath extends DrawableSliderPath {
  override colorAt(position: number): ColorSource {
    if (this.calculatedBorderPortion !== 0 && position <= this.calculatedBorderPortion)
      return this.borderColor;

    return ColorUtils.darkenSimple(this.accentColor, 4);
  }
}
