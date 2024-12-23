import type { ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { Slider } from '../../hitObjects/Slider';
import { Anchor, Axes, resolved } from 'osucad-framework';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { SkinnableDrawable } from '../../../../skinning/SkinnableDrawable';
import { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { OsuSelectionBlueprint } from './OsuSelectionBlueprint';

export class SliderSelectionBlueprint extends OsuSelectionBlueprint<Slider> {
  constructor() {
    super();
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  headCircle!: SkinnableDrawable;

  tailCircle!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

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

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    const hitObject = entry.hitObject as Slider;

    hitObject.path.invalidated.addListener(this.updatePosition, this);
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    const hitObject = entry.hitObject as Slider;

    hitObject.path.invalidated.addListener(this.updatePosition, this);
  }

  protected override onDefaultsApplied(hitObject: HitObject) {
    super.onDefaultsApplied(hitObject);

    this.updatePosition();
  }

  protected updatePosition() {
    this.scheduler.addOnce(this.#updatePositions, this);
  }

  #updatePositions() {
    this.position = this.hitObject!.stackedPosition;
    this.tailCircle.position = this.hitObject!.path.endPosition;
  }

  override get snapPositions(): Vec2[] {
    return [
      this.hitObject!.stackedPosition,
      this.hitObject!.stackedPosition.add(this.hitObject!.path.endPosition),
    ];
  }

  #updateEdgeSelection() {
    const headSelected = this.hitObject!.subSelection.anyHeadSelected;
    const tailSelected = this.hitObject!.subSelection.anyTailSelected;

    this.headCircle.color = headSelected ? 0xFF0000 : 0xFFFFFF;
    this.tailCircle.color = tailSelected ? 0xFF0000 : 0xFFFFFF;
  }
}
