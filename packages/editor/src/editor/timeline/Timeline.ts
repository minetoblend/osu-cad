import { Beatmap } from '@osucad/common';
import {
  Anchor,
  Axes,
  Box,
  Container,
  PIXIContainer,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { EditorClock } from '../EditorClock';
import { ThemeColors } from '../ThemeColors';
import { TimelineTick } from './TimelineTick';
import gsap from 'gsap';

export class Timeline extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  @dependencyLoader()
  init() {
    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: this.theme.translucent,
        alpha: 0.5,
      }),
    );

    this.drawNode.addChild((this.#tickContainer = new PIXIContainer()));

    this.addInternal(
      new Box({
        width: 2,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: this.theme.primary,
      }),
    );
  }

  update() {
    super.update();

    this.#updateTicks();
  }

  #tickContainer!: PIXIContainer<TimelineTick>;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  protected get controlPoints() {
    return this.beatmap.controlPoints;
  }

  zoom = 1;

  get visibleDuration() {
    return this.zoom * 2000;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  get startTime() {
    return this.editorClock.currentTime - this.visibleDuration / 2;
  }

  get endTime() {
    return this.editorClock.currentTime + this.visibleDuration / 2;
  }

  timeToPosition(time: number) {
    return (time - this.startTime) * this.pixelsPerMs;
  }

  positionToTime(time: number) {
    return time / this.pixelsPerMs + this.startTime;
  }

  durationToSize(duration: number) {
    return duration * this.pixelsPerMs;
  }

  get pixelsPerMs() {
    return this.drawSize.x / this.visibleDuration;
  }

  #updateTicks() {
    this.#tickContainer.y = this.drawSize.y * 0.5;
    this.#tickContainer.scale.set(1, this.drawSize.y);

    const ticks = this.controlPoints.getTicks(
      this.startTime,
      this.endTime,
      4, //this.clock.beatSnapDivisor,
    );

    for (let i = this.#tickContainer.children.length; i < ticks.length; i++) {
      this.#tickContainer.addChild(new TimelineTick());
    }
    if (ticks.length < this.#tickContainer.children.length) {
      this.#tickContainer.removeChildren(
        ticks.length,
        this.#tickContainer.children.length,
      );
    }

    for (let i = 0; i < ticks.length; i++) {
      const tick = this.#tickContainer.children[i];
      const tickInfo = ticks[i];
      tick.x = this.timeToPosition(tickInfo.time);
      tick.type = tickInfo.type;
    }
  }

  zoomSpeed = 0.3;

  zoomOut(factor: number = 1) {
    gsap.to(this, {
      zoom: Math.min(this.zoom * (1 + this.zoomSpeed * factor), 8),
      duration: 0.15,
      ease: 'power2.out',
    });
  }

  zoomIn(factor: number = 1) {
    gsap.to(this, {
      zoom: Math.max(this.zoom / (1 + this.zoomSpeed * factor), 0.25),
      duration: 0.15,
      ease: 'power2.out',
    });
  }
}
