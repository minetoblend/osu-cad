import type { DifficultyPoint } from '../../../controlPoints/DifficultyPoint';
import {
  Anchor,
  Axes,
  clamp,
  Container,
  dependencyLoader,
  RoundedBox,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { KeyframeBlueprint } from './KeyframeBlueprint';

export class SliderVelocityKeyframeBlueprint extends KeyframeBlueprint<DifficultyPoint> {
  constructor() {
    super();
  }

  #svText!: OsucadSpriteText;

  #label!: Container;

  override get keyframeColor(): number {
    return 0xFFBE40;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      this.#label = new Container({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.CenterLeft,
        x: 10,
        y: 10,
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            color: this.keyframeColor,
            fillAlpha: 0.1,
            cornerRadius: 1,
            outlines: [{
              width: 1,
              alpha: 1,
              color: 0xFFFFFF,
            }],
          }),
          this.#svText = new OsucadSpriteText({
            fontSize: 11,
            margin: 3,
            color: this.keyframeColor,
          }),
        ],
      }),
    );
  }

  override update() {
    super.update();

    const duration = this.entry!.lifetimeEnd - this.entry!.lifetimeStart;
    this.#label.x = clamp(-this.x, 0, this.timeline.durationToSize(duration) - this.#label.drawWidth - 10) + 10;
  }

  override onInvalidated() {
    super.onInvalidated();

    this.#svText.text = `${this.entry!.start.sliderVelocity.toFixed(2)}x`;
  }
}
