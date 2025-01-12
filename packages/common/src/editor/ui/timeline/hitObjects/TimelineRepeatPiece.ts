import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { IHasRepeats } from '../../../../hitObjects/IHasRepeats';
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
    this.origin = Anchor.Center;
    this.anchor = Anchor.CenterLeft;

    this.addInternal(new DrawableSprite({
      texture: this.skin.getTexture('reversearrow'),
      size: 0.75,
      relativeSizeAxes: Axes.Both,
      scale: 60 / 64,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    const slider = this.blueprint.hitObject! as unknown as IHasRepeats;

    this.x = ((this.repeat.repeatIndex + 1) / (slider.repeatCount + 1));
  }
}
