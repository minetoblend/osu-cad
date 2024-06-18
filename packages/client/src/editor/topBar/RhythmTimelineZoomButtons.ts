import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '@/framework/drawable/ContainerDrawable.ts';
import { RoundedBox } from '@/framework/drawable/RoundedBox.ts';
import { Axes } from '@/framework/drawable/Axes.ts';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent.ts';
import gsap from 'gsap';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite.ts';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import plus from '@/assets/icons/plus.png';
import minus from '@/assets/icons/minus.png';
import { AudioManager } from '@/framework/audio/AudioManager.ts';
import { UISamples } from '@/editor/UISamples.ts';
import { RhythmTimeline } from '@/editor/topBar/RhythmTimeline.ts';
import { Ticker } from 'pixi.js';

export class RhythmTimelineZoomButtons extends ContainerDrawable {
  constructor(
    readonly rhythmTimeline: RhythmTimeline,
    options: ContainerDrawableOptions = {},
  ) {
    super({
      ...options,
      skew: { x: -0.25, y: 0 },
    });
    this.add(
      new ZoomButton({
        relativeSizeAxes: Axes.Both,
        height: 0.48,
        texture: plus,
        action: () => this.rhythmTimeline.zoomIn(),
        onLongPress: () => {
          this.rhythmTimeline.zoomIn(Ticker.shared.deltaTime);
        },
      }),
    );
    this.add(
      new ZoomButton({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        height: 0.48,
        y: 0.52,
        texture: minus,
        action: () => this.rhythmTimeline.zoomOut(),
        onLongPress: () => {
          this.rhythmTimeline.zoomOut(Ticker.shared.deltaTime);
        },
      }),
    );
  }
}

class ZoomButton extends ContainerDrawable {
  constructor(
    options: ContainerDrawableOptions & {
      texture: string;
      action: () => void;
      onLongPress?: () => void;
    },
  ) {
    super(options);
    this.action = options.action;
    this.onLongPress = options.onLongPress;
    this.background = this.addInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0xffffff,
        cornerRadius: 6,
        fillAlpha: 0,
        // skew: { x: -0.25, y: 0 },
      }),
    );
    this.sprite = this.add(
      new DrawableSprite({
        texture: options.texture,
        width: 14,
        height: 14,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
        alpha: 0.25,
        // x: -4,
        skew: { x: 0.25, y: 0 },
      }),
    );
  }

  action: () => void;
  onLongPress?: () => void;

  background: RoundedBox;
  sprite: DrawableSprite;

  onHover(event: MouseDownEvent): boolean {
    gsap.to(this.background, {
      fillAlpha: 0.05,
      duration: 0.1,
    });
    gsap.to(this.sprite, {
      alpha: 0.9,
      duration: 0.1,
    });
    return super.onHover(event);
  }

  onHoverLost(event: MouseDownEvent): boolean {
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
    return super.onHoverLost(event);
  }

  pressedAt?: number;

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      this.action();
      this.background.outlines = [
        {
          color: 0xffffff,
          alpha: 0.1,
          width: 2,
        },
      ];
      this.dependencies.resolve(AudioManager).playSound(
        {
          buffer: this.dependencies.resolve(UISamples).toolSwitch,
        },
        'ui',
      );
      this.pressedAt = Date.now();
      return true;
    }
    return false;
  }

  onMouseUp(event: MouseDownEvent): boolean {
    this.background.outlines = [];
    this.pressedAt = undefined;
    return super.onMouseUp(event);
  }

  childrenCanBeOutOfBounds(): boolean {
    return true;
  }

  onTick() {
    if (this.pressedAt && Date.now() - this.pressedAt > 300) {
      this.onLongPress?.();
    }
  }
}
