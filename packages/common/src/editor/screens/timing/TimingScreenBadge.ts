import type { ContainerOptions, HoverEvent, MouseDownEvent } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import { Axes, Container, dependencyLoader, resolved, RoundedBox } from 'osucad-framework';
import { Timeline } from '../../ui/timeline/Timeline';
import { TimingScreenSelectionBlueprint } from './TimingScreenSelectionBlueprint';

export abstract class TimingScreenBadge extends Container {
  protected constructor(options: ContainerOptions = {}) {
    super(options);
  }

  readonly #content = new Container({
    autoSizeAxes: Axes.Both,
  });

  override get content(): Container {
    return this.#content;
  }

  abstract readonly backgroundColor: ColorSource;

  @dependencyLoader()
  [Symbol('load')]() {
    this.autoSizeAxes = Axes.Both;

    this.addAllInternal(
      this.createBackground(),
      this.#content,
    );
  }

  protected createBackground() {
    return new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 2,
      fillAlpha: 0.1,
      color: this.backgroundColor,
      outlines: [{
        width: 1,
        color: 0xFFFFFF,
      }],
    });
  }

  @resolved(TimingScreenSelectionBlueprint)
  protected selectionBlueprint!: TimingScreenSelectionBlueprint<ControlPoint>;

  @resolved(Timeline)
  protected timeline!: Timeline;

  override update() {
    super.update();

    const duration = this.selectionBlueprint.entry!.lifetimeEnd - this.selectionBlueprint.entry!.lifetimeStart;
    // this.x = clamp(-this.selectionBlueprint.x, 0, this.timeline.durationToSize(duration) - this.drawWidth - 10) + 10;
  }

  override onHover(e: HoverEvent): boolean {
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }
}
