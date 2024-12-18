import type { ContainerOptions } from 'osucad-framework';
import { Axes, dependencyLoader, Direction, EmptyDrawable } from 'osucad-framework';
import { OsucadScrollContainer } from '../../../drawables/OsucadScrollContainer';
import { Timeline } from './Timeline';

export class ScrollingTimeline extends Timeline {
  constructor(options: ContainerOptions = {}) {
    super();
    this.with(options);
  }

  readonly #scrollContainer = new OsucadScrollContainer(Direction.Horizontal).with({
    relativeSizeAxes: Axes.Both,
    children: [
      new EmptyDrawable(),
    ],
  });

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(this.#scrollContainer);
    this.#scrollContainer.content.autoSizeAxes = Axes.None;
    this.#scrollContainer.distanceDecayJump = 0.02;
    this.#scrollContainer.distanceDecayScroll = 0.015;
  }

  override get currentTime(): number {
    return super.currentTime;
  }

  override set currentTime(value: number) {
    this.#scrollContainer.scrollTo(this.durationToSize(value), !this.editorClock.isRunning);
  }

  override update() {
    super.update();

    super.currentTime = this.sizeToDuration(this.#scrollContainer.current);
    this.#scrollContainer.content.width = this.durationToSize(this.editorClock.trackLength);
  }
}
