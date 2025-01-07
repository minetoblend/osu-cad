import type { TickInfo } from '../../../controlPoints/TickGenerator';
import { Axes, CompositeDrawable, PIXIContainer, resolved } from 'osucad-framework';
import { Color, Sprite, Texture } from 'pixi.js';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { TickType } from '../../../controlPoints/TickType';
import { EditorClock } from '../../EditorClock';
import { Timeline } from './Timeline';

const tickColors = {
  [TickType.Full]: new Color(0xFFFFFF),
  [TickType.Half]: new Color(0xFF0000),
  [TickType.Third]: new Color(0xFF00FF),
  [TickType.Quarter]: new Color(0x3687F7),
  [TickType.Sixth]: new Color(0xFF77FF),
  [TickType.Eighth]: new Color(0xFFFF00),
  [TickType.Other]: new Color(0x777777),
} as const;

export enum TickPlacement {
  Bottom = 0,
  FullHeight = 1,
}

export class TimelineTickContainer extends CompositeDrawable {
  constructor(readonly placement: TickPlacement = TickPlacement.Bottom) {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(ControlPointInfo)
  controlPoints!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #tickContainer = new PIXIContainer<TimelineTick>();

  protected override loadComplete() {
    super.loadComplete();

    this.drawNode.addChild(this.#tickContainer);
  }

  override update() {
    super.update();

    const ticks = [
      ...this.controlPoints.tickGenerator.generateTicks(
        this.timeline.startTime,
        this.timeline.endTime,
        this.editorClock.beatSnapDivisor.value,
      ),
    ];

    for (let i = this.#tickContainer.children.length; i < ticks.length; i++)
      this.#tickContainer.addChild(new TimelineTick());

    if (ticks.length < this.#tickContainer.children.length) {
      this.#tickContainer.removeChildren(
        ticks.length,
        this.#tickContainer.children.length,
      );
    }

    for (let i = 0; i < ticks.length; i++) {
      const tick = this.#tickContainer.children[i];
      const tickInfo = ticks[i];
      tick.x = this.timeline.positionAtTime(tickInfo.time);

      this.updateTick(tick, tickInfo);
    }
  }

  updateTick(tick: TimelineTick, tickInfo: TickInfo) {
    tick.tint = this.#getTickColor(tickInfo.type);
    tick.alpha = tickInfo.time < 0 ? 0.25 : 1;
    tick.scale.set(1, this.drawHeight);
  }

  #getTickColor(type: TickType) {
    return tickColors[type as keyof typeof tickColors] ?? tickColors[TickType.Other];
  }
}

class TimelineTick extends Sprite {
  constructor() {
    super({
      texture: Texture.WHITE,
      width: 4,
    });
  }
}
