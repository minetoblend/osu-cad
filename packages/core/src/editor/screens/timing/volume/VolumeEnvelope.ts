import type { Graphics } from 'pixi.js';
import type { VolumePointSelectionBlueprint } from './VolumePointSelectionBlueprint';
import { Axes, dependencyLoader, GraphicsDrawable, resolved } from '@osucad/framework';
import { VolumeCurveType } from '../../../../controlPoints/VolumePoint';
import { Timeline } from '../../../ui/timeline/Timeline';

export class VolumeEnvelope extends GraphicsDrawable {
  constructor(
    readonly blueprint: VolumePointSelectionBlueprint,
  ) {
    super();

    blueprint.volumeBindable.valueChanged.addListener(this.invalidateGraphics, this);
    blueprint.endVolumeBindable.valueChanged.addListener(this.invalidateGraphics, this);
    blueprint.curveTypeBindable.valueChanged.addListener(this.invalidateGraphics, this);
    blueprint.p1Bindable.valueChanged.addListener(this.invalidateGraphics, this);
    blueprint.p2Bindable.valueChanged.addListener(this.invalidateGraphics, this);
  }

  override updateGraphics(g: Graphics) {
    g.clear();

    const startVolume = this.blueprint.volumeBindable.value;
    const endVolume = this.blueprint.endVolumeBindable.value;
    const curveType = this.blueprint.curveTypeBindable.value;

    const backgroundAlpha = 0.15;

    if (curveType === VolumeCurveType.Constant || !this.blueprint.entry!.end) {
      g.rect(0, (1 - startVolume / 100) * this.drawHeight, this.drawWidth, this.drawHeight * (startVolume / 100))
        .fill({
          color: this.blueprint.keyframeColor.value,
          alpha: backgroundAlpha,
        });

      g.moveTo(0, (1 - startVolume / 100) * this.drawHeight)
        .lineTo(this.drawWidth, (1 - startVolume / 100) * this.drawHeight)
        .lineTo(this.drawWidth, (1 - endVolume / 100) * this.drawHeight)
        .stroke({
          color: this.blueprint.keyframeColor.value,
        });
    }
    else if (this.blueprint.controlPoint!.isLinear) {
      g.poly([
        { x: 0, y: (1 - startVolume / 100) * this.drawHeight },
        { x: this.drawWidth, y: (1 - endVolume / 100) * this.drawHeight },
        { x: this.drawWidth, y: this.drawHeight },
        { x: 0, y: this.drawHeight },
      ]).fill({
        color: this.blueprint.keyframeColor.value,
        alpha: backgroundAlpha,
      });

      g.moveTo(0, (1 - startVolume / 100) * this.drawHeight)
        .lineTo(this.drawWidth, (1 - endVolume / 100) * this.drawHeight)
        .stroke({
          color: this.blueprint.keyframeColor.value,
        });
    }
    else {
      g.moveTo(0, (1 - startVolume / 100) * this.drawHeight);

      const startTime = this.blueprint.entry!.lifetimeStart;
      const endTime = this.blueprint.entry!.lifetimeEnd;

      const current = this.blueprint.controlPoint!;
      const next = this.blueprint.entry!.end;

      for (let i = 0; i < this.drawWidth + 2; i += 2) {
        i = Math.min(i, this.drawWidth);

        const time = startTime + i / this.drawWidth * (endTime - startTime);
        const volume = current.volumeAtTime(time, next);

        g.lineTo(i, this.drawHeight * (1 - volume / 100));
      }

      g.lineTo(this.drawWidth, this.drawHeight)
        .lineTo(0, this.drawHeight)
        .closePath()
        .fill({
          color: this.blueprint.keyframeColor.value,
          alpha: backgroundAlpha,
        });

      g.moveTo(0, (1 - startVolume / 100) * this.drawHeight);
      for (let i = 0; i < this.drawWidth + 2; i += 2) {
        i = Math.min(i, this.drawWidth);

        const time = startTime + i / this.drawWidth * (endTime - startTime);
        const volume = current.volumeAtTime(time, next);

        g.lineTo(i, this.drawHeight * (1 - volume / 100));
      }

      g.stroke({
        color: this.blueprint.keyframeColor.value,
      });
    }
  }

  @resolved(Timeline)
  timeline!: Timeline;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;
  }
}
