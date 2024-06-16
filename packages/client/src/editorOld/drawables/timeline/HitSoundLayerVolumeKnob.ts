import { Drawable } from '../Drawable.ts';
import { HitSoundLayer } from '@osucad/common';
import { Circle, Graphics } from 'pixi.js';
import { getSampleSetColor } from './CampleSetColors.ts';
import { clamp } from '@vueuse/core';

export class HitSoundLayerVolumeKnob extends Drawable {
  knob = new Graphics();

  constructor(private layer: HitSoundLayer) {
    super();

    this.addChild(this.knob);
    this.hitArea = new Circle(0, 0, 10);
    this.eventMode = 'static';
    this.onwheel = (e) => {
      e.stopImmediatePropagation();
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      const newVolume = clamp(this.layer.volume - e.deltaY * 0.001, 0, 1);
      this.layer.volume = newVolume;
    };
  }

  onLoad() {}

  _volume = -1;

  onTick() {
    if (this._volume != this.layer.volume) {
      this.drawKnob();
    }
  }

  drawKnob() {
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 0.25 + Math.PI * 2;
    const volume = this.layer.volume;

    this.knob
      .clear()
      .circle(0, 0, 5)
      .fill({ color: 0xffffff, alpha: 0.1 })
      .stroke({ color: 0x000000, alpha: 0.5 })
      .beginPath()
      .arc(0, 0, 7.5, startAngle, endAngle, true)
      .stroke({ color: 0x000000, alpha: 0.25, width: 1.5 })
      .arc(
        0,
        0,
        7.5,
        startAngle,
        startAngle + (endAngle - startAngle) * volume,
        false,
      )
      .stroke({
        color: getSampleSetColor(this.layer.sampleSet),
        alpha: 1.0,
        width: 1.5,
        cap: 'round',
      });
  }
}
