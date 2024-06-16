import { HitSoundTimeline } from './HitSoundTimeline.ts';
import { Component } from '../Component.ts';
import { Assets, FederatedPointerEvent, Sprite } from 'pixi.js';
import { Inject } from '../di';
import { BeatInfo } from '../../beatInfo.ts';
import { hitObjectId, HitSoundSample, Vec2 } from '@osucad/common';
import { EditorContext } from '@/editorOld/editorContext.ts';

export class HitSoundPlacementTool extends Component {
  constructor(private readonly timeline: HitSoundTimeline) {
    super();
    this.eventMode = 'static';
    this.addChild(this.previewSample);
  }

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  get startTime() {
    return this.timeline.startTime;
  }

  get endTime() {
    return this.timeline.endTime;
  }

  getTimeAtX(x: number) {
    return this.startTime + (this.endTime - this.startTime) * (x / this.size.x);
  }

  getXAtTime(time: number) {
    return (
      ((time - this.startTime) / (this.endTime - this.startTime)) * this.size.x
    );
  }

  private previewSample = new Sprite({
    texture: Assets.get('hitsample'),
    anchor: { x: 0.5, y: 0.5 },
    scale: { x: 0.5, y: 0.5 },
    visible: false,
    alpha: 0.5,
  });

  @Inject(BeatInfo)
  private beatInfo!: BeatInfo;

  mousePos?: Vec2;

  onpointermove = (e: FederatedPointerEvent) => {
    this.mousePos = Vec2.from(e.getLocalPosition(this));
  };

  insertPosition?: {
    time: number;
    layer: number;
  };

  onpointerenter = (e: FederatedPointerEvent) =>
    (this.mousePos = Vec2.from(e.getLocalPosition(this)));
  onpointerleave = () => (this.mousePos = undefined);

  onTick() {
    if (this.mousePos) {
      this.previewSample.visible = true;
      const time = Math.round(
        this.beatInfo.snap(this.getTimeAtX(this.mousePos.x)),
      );
      const layer = Math.floor((this.size.y - this.mousePos.y) / 20);
      this.insertPosition = { time, layer };
      this.previewSample.position.set(
        this.getXAtTime(time),
        this.size.y - layer * 20 - 10,
      );
    } else {
      this.previewSample.visible = false;
    }
  }

  onpointerdown = (e: FederatedPointerEvent) => {
    if (e.button === 0 && this.insertPosition) {
      const hitSounds = this.editor.beatmapManager.beatmap.hitSounds;
      const layer = hitSounds.layers[this.insertPosition.layer];
      if (!layer) return;

      layer.samples.push(
        new HitSoundSample({
          time: this.insertPosition.time,
          id: hitObjectId(),
        }),
      );
    } else if (e.button === 2 && this.insertPosition) {
      const hitSounds = this.editor.beatmapManager.beatmap.hitSounds;
      const layer = hitSounds.layers[this.insertPosition.layer];
      if (!layer) return;
      const sample = layer.samples.find(
        (s) => s.time === this.insertPosition!.time,
      );
      if (!sample) return;
      layer.samples.splice(layer.samples.indexOf(sample), 1);
    }
  };
}
