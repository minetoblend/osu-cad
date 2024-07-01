import {
  Anchor,
  Axes,
  ClickEvent,
  Container,
  ContainerOptions,
  DrawableSprite,
  HoverEvent,
  HoverLostEvent,
  MouseButton,
  MouseDownEvent,
  MouseUpEvent,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Timeline } from './Timeline';
import { Texture } from 'pixi.js';
import { UIIcons } from '../UIIcons';
import gsap from 'gsap';

export class TimelineZoomButtons extends Container {
  constructor(
    readonly timeline: Timeline,
    options: ContainerOptions = {},
  ) {
    super({
      ...options,
      skew: { x: -0.25, y: 0 },
    });
  }

  @resolved(UIIcons)
  icons!: UIIcons;

  @dependencyLoader()
  load() {
    this.add(
      new ZoomButton({
        relativeSizeAxes: Axes.Both,
        height: 0.48,
        texture: this.icons.plus,
        action: () => this.timeline.zoomIn(),
        onLongPress: () => {
          this.timeline.zoomIn(this.time.elapsed * 0.05);
        },
      }),
    );
    this.add(
      new ZoomButton({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        height: 0.48,
        y: 0.52,
        texture: this.icons.minus,
        action: () => this.timeline.zoomOut(),
        onLongPress: () => {
          this.timeline.zoomOut(this.time.elapsed * 0.05);
        },
      }),
    );
  }
}

class ZoomButton extends Container {
  constructor(
    options: ContainerOptions & {
      texture: Texture;
      action: () => void;
      onLongPress?: () => void;
    },
  ) {
    super(options);
    this.action = options.action;
    this.onLongPress = options.onLongPress;
    this.addInternal(
      (this.background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0xffffff,
        cornerRadius: 6,
        fillAlpha: 0,
      })),
    );
    this.add(
      (this.sprite = new DrawableSprite({
        texture: options.texture,
        width: 14,
        height: 14,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0.25,
        skew: { x: 0.25, y: 0 },
      })),
    );
  }

  action: () => void;
  onLongPress?: () => void;

  background: RoundedBox;
  sprite: DrawableSprite;

  onHover(event: HoverEvent): boolean {
    gsap.to(this.background, {
      fillAlpha: 0.05,
      duration: 0.1,
    });
    gsap.to(this.sprite, {
      alpha: 0.9,
      duration: 0.1,
    });
    return true;
  }

  onHoverLost(event: HoverLostEvent): boolean {
    gsap.to(this.background, {
      fillAlpha: 0.0,
      duration: 0.1,
    });
    gsap.to(this.sprite, {
      alpha: 0.25,
      duration: 0.1,
    });
    this.background.outlines = [];
    this.pressedAt = undefined;
    return true;
  }

  pressedAt?: number;

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.button === MouseButton.Left) {
      this.background.outlines = [
        {
          color: 0xffffff,
          alpha: 0.1,
          width: 2,
        },
      ];
      this.pressedAt = Date.now();
      return true;
    }
    return false;
  }

  wasLongPress = false;

  onClick(e: ClickEvent): boolean {
    if (!this.wasLongPress) {
      this.action();
    }

    return true;
  }

  onMouseUp(event: MouseUpEvent): boolean {
    this.background.outlines = [];
    this.wasLongPress = !!(this.pressedAt && Date.now() - this.pressedAt > 300);
    this.pressedAt = undefined;
    return true;
  }

  update() {
    super.update();

    if (this.pressedAt && Date.now() - this.pressedAt > 300) {
      this.onLongPress?.();
    }
  }
}
