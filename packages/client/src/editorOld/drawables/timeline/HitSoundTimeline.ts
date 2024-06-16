import { Component } from '../Component.ts';
import { Box } from '../Box.ts';
import {
  Assets,
  Container,
  ObservablePoint,
  Point,
  Sprite,
  Texture,
  TilingSprite,
} from 'pixi.js';
import { Inject } from '../di';
import { HitSoundLayerDrawable } from './HitSoundLayerDrawable.ts';
import { Rect, TickType } from '@osucad/common';
import { TimelineZoom } from '../../TimelineZoom.ts';
import { BeatInfo } from '../../beatInfo.ts';
import { HitSoundPlacementTool } from './HitSoundPlacementTool.ts';
import { EditorContext } from '@/editorOld/editorContext.ts';

export class HitSoundTimeline extends Component {
  constructor(private zoom: TimelineZoom) {
    super();
  }

  private placementTool = new HitSoundPlacementTool(this);

  private readonly currentTimeMarker = new Sprite({
    texture: Assets.get('timeline-tick'),
    anchor: new Point(0.5, 0.5),
    scale: new Point(0.55, 0.55),
    tint: 0x63e2b7,
  });

  background = new Box({
    tint: 0x1a1a20,
  });

  tickContainer = new Container();

  layerContainer = new Container();

  @Inject(EditorContext)
  private readonly editor!: EditorContext;
  @Inject(BeatInfo)
  private readonly beatInfo!: BeatInfo;

  private readonly tickPool: Tick[] = [];

  get hitSounds() {
    return this.editor.beatmapManager.beatmap.hitSounds;
  }

  onLoad() {
    this.size.y = this.hitSounds.layers.length * 20;
    this.addChild(
      this.background,
      this.tickContainer,
      this.layerContainer,
      this.placementTool,
      this.currentTimeMarker,
    );
    this.visible = window.location.search.includes('hitsounds');
    this.updateLayers();
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    if (this.size.x === 0 || this.size.y === 0) return;
    this.background.setSize(this.size.x, this.size.y);
    this.pivot.y = this.size.y;
    this.currentTimeMarker.position.set(
      250 + (this.size.x - 260) * 0.4,
      this.size.y * 0.5 + 5,
    );
    this.currentTimeMarker.height = this.size.y + 10;
    for (const layer of this.layerContainer.children) {
      (layer as HitSoundLayerDrawable).size.x = this.size.x;
    }
    this.placementTool.setBounds(
      new Rect(250, 0, this.size.x - 260, this.size.y),
    );
  }

  updateLayers() {
    const layerHeight = 20;
    for (let i = 0; i < this.hitSounds.layers.length; i++) {
      const layer = this.hitSounds.layers[i];
      const drawable = new HitSoundLayerDrawable(layer, this);
      this.layerContainer.addChild(drawable);
      drawable.setBounds(
        new Rect(
          0,
          this.size.y - i * layerHeight - layerHeight,
          this.size.x,
          layerHeight,
        ),
      );
    }
  }

  get startTime() {
    return (
      this.editor.clock.currentTimeAnimated - this.zoom.visibleDuration * 0.4
    );
  }

  get endTime() {
    return (
      this.editor.clock.currentTimeAnimated + this.zoom.visibleDuration * 0.6
    );
  }

  onTick() {
    this.updateChildDrawables = this.visible;
    if (!this.visible) return;

    const controlPoints = this.editor.beatmapManager.controlPoints;

    if (!controlPoints) return;

    const startTime = this.startTime;
    const endTime = this.endTime;
    const ticks = controlPoints.getTicks(
      startTime,
      endTime,
      this.beatInfo.beatSnap,
    );

    const skipped = 0;
    for (let i = 0; i < ticks.length; i++) {
      let tick = this.tickContainer.children[i] as Tick | undefined;
      const x = this.getPositionForTime(ticks[i].time);

      if (!tick) {
        tick = this.tickPool.pop() ?? new Tick();
        this.tickContainer.addChild(tick);
      }

      tick.visible = x >= 250;

      tick.position.set(x, 0);
      tick.scale.set(1, this.size.y);
      tick.type = ticks[i].type;
    }
    if (ticks.length - skipped < this.tickContainer.children.length)
      this.tickPool.push(
        ...(this.tickContainer.removeChildren(
          ticks.length - skipped,
        ) as Tick[]),
      );

    this.tickPool.splice(30).forEach((tick) => tick.destroy());
  }

  getPositionForTime(time: number) {
    return (
      250 +
      ((time - this.startTime) / (this.endTime - this.startTime)) *
        (this.size.x - 260)
    );
  }
}

class Tick extends TilingSprite {
  constructor() {
    super({
      texture: Texture.WHITE,
    });
    this.anchor.set(0.5, 0);
  }

  private _type?: TickType;

  set type(type: TickType) {
    if (this._type === type) return;
    this._type = type;
    if (type === TickType.Full) {
      this.width = 2;
    } else {
      this.width = 1;
    }

    this.tint = 0x000000;
    this.alpha = 0.35;
  }
}
