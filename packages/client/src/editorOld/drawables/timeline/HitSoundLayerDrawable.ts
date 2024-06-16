import { Component } from '../Component.ts';
import { HitSoundLayer, SampleSet, SampleType } from '@osucad/common';
import {
  Container,
  FillGradient,
  Graphics,
  ObservablePoint,
  Point,
  Sprite,
  Text,
} from 'pixi.js';
import { Box } from '../Box.ts';
import { getSampleSetColor } from './CampleSetColors.ts';
import { HitSoundLayerToggle } from './HitSoundLayerToggle.ts';
import { HitSoundLayerVolumeKnob } from './HitSoundLayerVolumeKnob.ts';
import { HitSoundTimeline } from './HitSoundTimeline.ts';
import { HitSampleDrawable } from './HitSampleDrawable.ts';
import gsap from 'gsap';

export class HitSoundLayerDrawable extends Component {
  highlightGradient: Sprite;

  constructor(
    public readonly layer: HitSoundLayer,
    private readonly timeline: HitSoundTimeline,
  ) {
    super();
    this.layerToggle = new HitSoundLayerToggle(this.layer);
    this.volumeKnob = new HitSoundLayerVolumeKnob(this.layer);
    this.addChild(
      this.layerName,
      this.hoverBackground,
      this.centerLineHighlight,
      this.centerLine,
      this.indicator,
      this.layerToggle,
      this.layerToggle,
      this.volumeKnob,
      this.sampleContainer,
    );
    let name = layer.name;
    if (!name) {
      if (layer.customFilename) {
        name = layer.customFilename;
      } else {
        name = '';
        switch (layer.sampleSet) {
          case SampleSet.Soft:
            name += 'soft';
            break;
          case SampleSet.Normal:
            name += 'normal';
            break;
          case SampleSet.Drum:
            name += 'drum';
            break;
        }
        name += '-';
        switch (layer.type) {
          case SampleType.Normal:
            name += 'hitnormal';
            break;
          case SampleType.Whistle:
            name += 'hitwhistle';
            break;
          case SampleType.Finish:
            name += 'hitfinish';
            break;
          case SampleType.Clap:
            name += 'hitclap';
            break;
        }
      }
    }

    const gradient = new FillGradient(0, 0, 1, 0);
    gradient.addColorStop(0, 0x000000);
    gradient.addColorStop(0.4, 0xffffff);
    gradient.addColorStop(0.8, 0x000000);

    gradient.buildLinearGradient();

    this.highlightGradient = this.addChild(
      new Sprite({
        texture: gradient.texture,
      }),
    );

    this.centerLineHighlight.mask = this.highlightGradient;

    this.layerName.text = name;
  }

  sampleContainer = new Container({
    x: 250,
  });

  private readonly layerName = new Text({
    text: '',
    style: {
      fontFamily: 'Nunito Sans',
      fontSize: 15,
      fill: 0xffffff,
    },
    resolution: 2,
    anchor: new Point(0, 0.5),
    position: new Point(0, 0),
  });

  private readonly hoverBackground = new Box({
    tint: 0xffffff,
    alpha: 0.1,
    visible: false,
  });

  centerLine = new Graphics({
    alpha: 0.35,
  });
  centerLineHighlight = new Graphics({
    alpha: 0,
  });

  indicator = new Graphics({
    alpha: 0.2,
  });

  layerToggle: HitSoundLayerToggle;
  volumeKnob: HitSoundLayerVolumeKnob;

  onLoad() {
    this.eventMode = 'static';
    this.onpointerenter = () => (this.hoverBackground.visible = true);
    this.onpointerleave = () => (this.hoverBackground.visible = false);
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    if (this.size.x === 0 || this.size.y === 0) return;

    this.layerToggle.position.set(10, this.size.y * 0.5);
    this.volumeKnob.position.set(30, this.size.y * 0.5);

    this.layerName.y = this.size.y * 0.5;
    this.layerName.x = 45;
    this.layerName.style.fontSize = this.size.y * 0.75;
    this.hoverBackground.width = this.size.x;
    this.hoverBackground.height = this.size.y;

    this.centerLine
      .clear()
      .moveTo(250, this.size.y * 0.5)
      .lineTo(this.size.x - 10, this.size.y * 0.5)
      .stroke({ color: 0x000000, alpha: 1, width: 4, cap: 'round' });

    this.centerLineHighlight
      .clear()
      .moveTo(250, this.size.y * 0.5)
      .lineTo(this.size.x - 10, this.size.y * 0.5)
      .stroke({ color: 0xffffff, alpha: 1, width: 7, cap: 'round' });

    this.centerLineHighlight.tint = getSampleSetColor(this.layer.sampleSet);

    this.indicator
      .moveTo(242, 3)
      .lineTo(242, this.size.y - 3)
      .stroke({
        color: getSampleSetColor(this.layer.sampleSet),
        alpha: 1,
        width: 4,
        cap: 'round',
      });

    this.highlightGradient.position.set(250, 0);
    this.highlightGradient.width = this.size.x - 260;
    this.highlightGradient.height = this.size.y;
  }

  private sampleDrawables = new Map<string, HitSampleDrawable>();

  onTick() {
    this.alpha = this.layer.enabled ? 1 : 0.5;
    const startTime = this.timeline.startTime;
    const endTime = this.timeline.endTime;

    const samples = this.layer.samples.filter(
      (it) => it.time >= startTime && it.time <= endTime,
    );

    const shouldDelete = new Set(this.sampleDrawables.keys());
    for (const sample of samples) {
      shouldDelete.delete(sample.id);
      let drawable = this.sampleDrawables.get(sample.id);
      if (!drawable) {
        drawable = new HitSampleDrawable(sample);
        this.sampleDrawables.set(sample.id, drawable);
        this.sampleContainer.addChild(drawable);
      }
      drawable.position.set(
        this.timeline.getPositionForTime(sample.time) - 250,
        this.size.y * 0.5,
      );
      drawable.time = sample.time;
      drawable.color = getSampleSetColor(this.layer.sampleSet);
    }
    for (const id of shouldDelete) {
      const drawable = this.sampleDrawables.get(id);
      if (drawable) {
        this.sampleContainer.removeChild(drawable).destroy();
      }
      this.sampleDrawables.delete(id);
    }
  }

  onSoundPlayed() {
    this.indicator.alpha = 1;
    gsap.killTweensOf(this.indicator);
    gsap.to(this.indicator, {
      alpha: 0.2,
      duration: 0.5,
      ease: 'power3.out',
    });

    gsap.killTweensOf(this.centerLineHighlight);
    this.centerLineHighlight.alpha = 0.4;
    gsap.to(this.centerLineHighlight, {
      alpha: 0,
      duration: 0.5,
      ease: 'power3.out',
    });
  }
}
