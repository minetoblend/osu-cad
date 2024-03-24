import { Component } from '@/editor/drawables/Component.ts';
import { Container, ObservablePoint, Rectangle } from 'pixi.js';
import { ObjectTimeline } from '@/editor/drawables/timeline/ObjectTimeline.ts';
import { TimelineZoom } from '@/editor/TimelineZoom.ts';
import { Box } from '@/editor/drawables/Box.ts';
import { Rect } from '@osucad/common';
import { PlayButton } from '@/editor/drawables/PlayButton.ts';
import { CurrentTimeIndicator } from '@/editor/drawables/timeline/CurrentTimeIndicator.ts';
import { OverviewTimeline } from '@/editor/drawables/timeline/OverviewTimeline.ts';
import { isMobile } from '@/utils';

export class MobileTimelineDrawable extends Component {
  mode: 'rhythm' | 'overview' = 'rhythm';
  zoom = new TimelineZoom();

  currentTimeline = new ObjectTimeline(this.zoom);
  timelineContainer = new Container();
  seekBar = new OverviewTimeline();
  timestamp = new CurrentTimeIndicator();

  background = new Box({
    tint: 0x1a1a20,
    alpha: isMobile() ? 0.75 : 1,
  });

  playButton = new PlayButton();

  constructor() {
    super();
  }

  onLoad() {
    this.addChild(
      this.background,
      this.timelineContainer,
      this.seekBar,
      this.playButton,
      this.timestamp,
    );
    this.timelineContainer.addChild(this.currentTimeline);
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.calculateLayout();
  }

  calculateLayout() {
    if (this.size.x === 0 || this.size.y === 0) return;

    const bounds = new Rect(0, 0, this.size.x, this.size.y);
    this.background.setSize(bounds.width, bounds.height);

    //bounds.shrink(4)

    this.timestamp.position.set(10, bounds.y + bounds.height * 0.5);
    this.timestamp.scale.set(0.8);
    bounds.splitLeft(150);

    this.playButton.setBounds(bounds.splitLeft(bounds.height));

    const seekbarBounds = bounds.splitBottom(this.size.y * 0.2);
    this.seekBar.setBounds(seekbarBounds);

    bounds.splitBottom(5);

    this.currentTimeline.setBounds(bounds);

    this.hitArea = new Rectangle(0, -10, this.size.x, this.size.y + 10);
  }
}
