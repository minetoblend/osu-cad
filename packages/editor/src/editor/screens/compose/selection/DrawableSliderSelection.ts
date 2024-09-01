import { Anchor, Axes, DrawableSprite, dependencyLoader, resolved } from 'osucad-framework';
import type { Slider } from '../../../../beatmap/hitObjects/Slider';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import { DrawableSelection } from './DrawableSelection';

export class DrawableSliderSelection extends DrawableSelection<Slider> {
  constructor() {
    super();
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  headCircle!: DrawableSprite;

  tailCircle!: DrawableSprite;

  @dependencyLoader()
  load() {
    this.origin = Anchor.Center;
    this.size = OsuHitObject.object_dimensions;

    this.addAllInternal(
      this.tailCircle = new DrawableSprite({
        texture: this.skin.getTexture('hitcircleselect'),
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.headCircle = new DrawableSprite({
        texture: this.skin.getTexture('hitcircleselect'),
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.positionBindable.addOnChangeListener(() => this.updatePosition());
    this.stackHeightBindable.addOnChangeListener(() => this.updatePosition());
    this.scaleBindable.addOnChangeListener((scale) => {
      this.headCircle.scale = scale.value;
      this.tailCircle.scale = scale.value;
    });
  }

  protected onApply(hitObject: Slider) {
    super.onApply(hitObject);

    this.hitObject.path.invalidated.addListener(this.updatePosition, this);
  }

  onFree(hitObject: OsuHitObject) {
    super.onFree(hitObject);

    this.hitObject.path.invalidated.removeListener(this.updatePosition);
  }

  protected onDefaultsApplied() {
    super.onDefaultsApplied();

    this.updatePosition();
  }

  protected updatePosition() {
    this.scheduler.addOnce(this.#updatePositions, this);
  }

  #updatePositions() {
    this.position = this.hitObject.stackedPosition;
    this.tailCircle.position = this.hitObject.path.endPosition;
  }
}
