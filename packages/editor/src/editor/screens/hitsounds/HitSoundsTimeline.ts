import type {
  DependencyContainer,
} from 'osucad-framework';
import type { HitSoundsTimelineLayer } from './HitSoundsTimelineLayer';
import { ControlPointInfo } from '@osucad/common';
import {
  Anchor,
  Axes,
  Box,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  resolved,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { EditorClock } from '../../EditorClock';
import { ThemeColors } from '../../ThemeColors';
import { HitSoundTimelineTick } from './HitSoundsTimelineTick';
import { HitSoundVolumeLayer } from './volume/HitSoundVolumeLayer';

export class HitSoundsTimeline extends CompositeDrawable {
  constructor() {
    super();
  }

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    this.masking = true;

    const theme = dependencies.resolve(ThemeColors);

    this.clock = this.editorClock;
    this.processCustomClock = false;

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#tickContainer = new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 180 },
      }),
      new OsucadSpriteText({
        text: 'Work in Progress',
        fontSize: 48,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        rotation: 0.12,
        alpha: 0.2,
      }),
      this.#layers = new FillFlowContainer<HitSoundsTimelineLayer>({
        direction: FillDirection.Vertical,
        relativeSizeAxes: Axes.X,
        layoutDuration: 500,
        layoutEasing: EasingFunction.OutExpo,
        children: [
          new HitSoundVolumeLayer(),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 180 },
        child: new Box({
          relativeSizeAxes: Axes.Y,
          width: 1.5,
          color: theme.primary,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
    );

    for (let i = 0; i < this.#layers.children.length; i++) {
      this.#layers.children[i].layerIndex = i;
    }
  }

  #tickContainer!: Container;

  #layers!: FillFlowContainer<HitSoundsTimelineLayer>;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  protected controlPoints!: ControlPointInfo;

  get visibleDuration() {
    return 3000;
  }

  update() {
    super.update();

    const ticks = this.controlPoints.tickGenerator.generateTicks(
      this.editorClock.currentTime - this.visibleDuration / 2,
      this.editorClock.currentTime + this.visibleDuration / 2,
      this.editorClock.beatSnapDivisor.value,
    );

    let numTicks = 0;

    for (const tick of ticks) {
      numTicks++;

      let drawable = this.#tickContainer.children[numTicks];

      if (!drawable)
        this.#tickContainer.add(drawable = new HitSoundTimelineTick());

      drawable.x = this.positionAtTime(tick.time);
    }

    while (numTicks < this.#tickContainer.children.length)
      this.#tickContainer.remove(this.#tickContainer.children[numTicks]);
  }

  get visibleStartTime() {
    return this.editorClock.currentTime - this.visibleDuration / 2;
  }

  get visibleEndTime() {
    return this.editorClock.currentTime + this.visibleDuration / 2;
  }

  positionAtTime(time: number) {
    return (time - this.visibleStartTime) * this.pixelsPerMs;
  }

  timeAtPosition(position: number) {
    return ((position - 180) / this.pixelsPerMs) + this.visibleStartTime;
  }

  get pixelsPerMs() {
    return (this.drawWidth - 180) / this.visibleDuration;
  }
}
