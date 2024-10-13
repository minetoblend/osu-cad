import type { Slider } from '../../../../beatmap/hitObjects/Slider';
import { Anchor, Axes, dependencyLoader, resolved } from 'osucad-framework';
import { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { OsuSkinComponentLookup } from '../../../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../../../skinning/SkinnableDrawable';
import { EditorSelection } from '../EditorSelection';
import { DrawableSelection } from './DrawableSelection';

export class DrawableSliderSelection extends DrawableSelection<Slider> {
  constructor() {
    super();
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  headCircle!: SkinnableDrawable;

  tailCircle!: SkinnableDrawable;

  @resolved(EditorSelection)
  protected selection!: EditorSelection;

  @dependencyLoader()
  load() {
    this.origin = Anchor.Center;
    this.size = OsuHitObject.object_dimensions;

    this.addAllInternal(
      this.tailCircle = new SkinnableDrawable(OsuSkinComponentLookup.HitCircleSelect).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.headCircle = new SkinnableDrawable(OsuSkinComponentLookup.HitCircleSelect).with({
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

    hitObject.path.invalidated.addListener(this.updatePosition, this);

    hitObject.subSelection.changed.addListener(this.#updateEdgeSelection, this);

    this.#updateEdgeSelection();
  }

  onFree(hitObject: Slider) {
    super.onFree(hitObject);

    hitObject.path.invalidated.removeListener(this.updatePosition);

    hitObject.subSelection.changed.removeListener(this.#updateEdgeSelection);
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

  #updateEdgeSelection() {
    const headSelected = this.hitObject.subSelection.anyHeadSelected;
    const tailSelected = this.hitObject.subSelection.anyTailSelected;

    this.headCircle.color = headSelected ? 0xFF0000 : 0xFFFFFF;
    this.tailCircle.color = tailSelected ? 0xFF0000 : 0xFFFFFF;
  }
}
