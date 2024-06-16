import { Inject } from '../di';
import { VIEWPORT_SIZE } from '../injectionKeys.ts';
import { ISize, Rect } from '@osucad/common';
import { Box } from '../Box.ts';
import { ObjectTimeline } from './ObjectTimeline.ts';
import { CurrentTimeIndicator } from './CurrentTimeIndicator.ts';
import { OverviewTimeline } from './OverviewTimeline.ts';
import { TimelineZoom } from '../../TimelineZoom.ts';
import { PlayButton } from '../PlayButton.ts';
import { HitSoundTimeline } from './HitSoundTimeline.ts';
import { Component } from '@/editorOld/drawables/Component.ts';
import { Rectangle } from 'pixi.js';

export class TimelineDrawable extends Component {
  @Inject(VIEWPORT_SIZE)
  private readonly canvasSize!: ISize;

  private readonly timelineZoom = new TimelineZoom();
  private readonly objectTimeline = new ObjectTimeline(this.timelineZoom);
  private readonly overviewTimeline = new OverviewTimeline();

  private readonly hitSoundTimeline = new HitSoundTimeline(this.timelineZoom);

  private readonly background = new Box({
    tint: 0x1a1a20,
  });

  private readonly timestamp = new CurrentTimeIndicator();

  private readonly playButton = new PlayButton();

  onLoad() {
    this.addChild(
      this.background,
      this.objectTimeline,
      this.overviewTimeline,
      this.timestamp,
      this.playButton,
      this.hitSoundTimeline,
      this.objectTimeline,
    );
    watchEffect(() => this.updateBounds());
    this.timestamp.position.set(10, 16);
  }

  updateBounds() {
    if (this.canvasSize.width === 0 || this.canvasSize.height === 0) return;

    const scale = Math.max(
      Math.min(this.canvasSize.height / 720, this.canvasSize.width / 1280),
      0.5,
    );

    const width = this.canvasSize.width / scale;
    const height = 75;

    const bounds = new Rect(0, 0, width, height);

    bounds.splitLeft(190);
    this.playButton.setBounds(bounds.splitLeft(60));

    bounds.splitRight(10);

    this.objectTimeline.setBounds(bounds.splitTop(55));
    console.log(this.objectTimeline.y);
    bounds.splitLeft(50);
    this.overviewTimeline.setBounds(bounds);

    this.background.setSize(width, height);

    this.hitSoundTimeline.position.set(0, 0);
    this.hitSoundTimeline.size.x = width;

    this.position.set(0, this.canvasSize.height - height * scale);
    this.scale.set(scale);
    this.hitArea = new Rectangle(0, -10, this.size.x, this.size.y + 10);
  }
}
