import { ContainerDrawableOptions } from '../../framework/drawable/ContainerDrawable.ts';
import { RoundedBox } from '../../framework/drawable/RoundedBox.ts';
import { Axes } from '../../framework/drawable/Axes.ts';
import { CompositeDrawable } from '../../framework/drawable/CompositeDrawable.ts';
import { Anchor } from '../../framework/drawable/Anchor.ts';
import { Vec2 } from '@osucad/common';
import { resolved } from '../../framework/di/DependencyLoader.ts';
import { EditorClock } from '../EditorClock.ts';
import { MarginPadding } from '../../framework/drawable/MarginPadding.ts';
import { MouseDownEvent } from '../../framework/input/events/MouseEvent.ts';

export class EditorProgressBar extends CompositeDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super({
      ...options,
      height: 6 + 8,
    });

    this.track = this.addInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.X,
        height: 2,
        cornerRadius: 1.5,
        color: 0xffffff,
        anchor: Anchor.CentreLeft,
        origin: Anchor.CentreLeft,
        alpha: 0.25,
      }),
    );

    this.activeTrack = this.addInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.X,
        height: 2,
        cornerRadius: 1.5,
        color: 0xffffff,
        anchor: Anchor.CentreLeft,
        origin: Anchor.CentreLeft,
        width: 0,
      }),
    );

    this.thumb = this.addInternal(
      new Thumb({
        size: new Vec2(8 + 8, 6 + 8),
        anchor: Anchor.Centre,
        origin: Anchor.CentreLeft,
        relativePositionAxes: Axes.X,
      }),
    );
  }

  track: RoundedBox;
  activeTrack: RoundedBox;
  thumb: Thumb;

  #progress = 0;

  @resolved(EditorClock)
  clock!: EditorClock;

  onTick() {
    if (this.#progress !== this.clock.progressAnimated) {
      this.#progress = this.clock.progressAnimated;
      this.activeTrack.width = this.#progress;
      this.thumb.x = this.#progress;
    }
  }

  dragging = false;

  onMouseDown(event: MouseDownEvent) {
    this.dragging = true;
    event.capture();
    return true;
  }

  onMouseMove(event: MouseDownEvent): boolean {
    if (this.dragging) {
      const position = this.toLocalSpace(event.screenSpacePosition);
      const progress = Math.max(0, Math.min(1, position.x / this.drawSize.x));
      this.clock.seek(progress * this.clock.songDuration, false);
    }

    return true;
  }

  onMouseUp(): boolean {
    this.dragging = false;
    return true;
  }
}

class Thumb extends CompositeDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super({
      ...options,
      padding: new MarginPadding(4),
    });

    this.thumb = this.addInternal(
      new RoundedBox({
        size: new Vec2(8, 6),
        cornerRadius: 3,
        color: 0xffffff,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
      }),
    );
  }

  thumb: RoundedBox;

  onHover(): boolean {
    this.thumb.scale = new Vec2(1.25);
    return true;
  }

  onHoverLost(): boolean {
    this.thumb.scale = new Vec2(1);
    return true;
  }

  dragging = false;

  onMouseDown(event: MouseDownEvent) {
    this.dragging = true;
    event.capture();
    return true;
  }

  @resolved(EditorClock)
  clock!: EditorClock;

  onMouseMove(event: MouseDownEvent): boolean {
    const parent = this.parent as EditorProgressBar;

    if (this.dragging) {
      const position = parent.toLocalSpace(event.screenSpacePosition);
      const progress = Math.max(0, Math.min(1, position.x / parent.drawSize.x));
      this.clock.seek(progress * this.clock.songDuration, false);
    }

    return true;
  }

  onMouseUp(): boolean {
    this.dragging = false;
    return true;
  }
}
