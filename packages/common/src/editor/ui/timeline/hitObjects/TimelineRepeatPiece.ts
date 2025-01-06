import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { SliderRepeat } from '../../../../rulesets/osu/hitObjects/SliderRepeat';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor, Axes, DrawableSprite, resolved } from 'osucad-framework';
import { Timeline } from '../Timeline';
import { TimelineHitObjectCircle } from './TimelineHitObjectCircle';

export class TimelineRepeatPiece extends TimelineHitObjectCircle {
  constructor(blueprint: TimelineHitObjectBlueprint, readonly repeat: SliderRepeat) {
    super(blueprint);
  }

  @resolved(Timeline)
  timeline!: Timeline;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativePositionAxes = Axes.X;

    this.addInternal(new DrawableSprite({
      texture: this.skin.getTexture('reversearrow'),
      size: 0.75,
      relativeSizeAxes: Axes.Both,
      scale: 60 / 64,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    const slider = this.blueprint.hitObject!;

    if (slider.duration !== 0)
      this.x = this.repeat.startTime - slider.startTime;
  }
}
