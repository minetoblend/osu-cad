import { Anchor, Axes, DrawableSprite, dependencyLoader, resolved } from 'osucad-framework';
import type { Slider } from '../../../../beatmap/hitObjects/Slider';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import { EditorSelection } from '../EditorSelection';
import { DrawableSelection } from './DrawableSelection';

export class DrawableSliderSelection extends DrawableSelection<Slider> {
  constructor() {
    super();
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  headCircle!: DrawableSprite;

  tailCircle!: DrawableSprite;

  @resolved(EditorSelection)
  protected selection!: EditorSelection;

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

    this.selection.selectionChanged.addListener(([hitObject, selected]) => {
      if (hitObject !== this.hitObject || !selected)
        return;

      this.#updateEdgeSelection();
    });
  }

  protected onApply(hitObject: Slider) {
    super.onApply(hitObject);

    this.hitObject.path.invalidated.addListener(this.updatePosition, this);

    this.#updateEdgeSelection();
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

  #updateEdgeSelection() {
    const edges = this.hitObject.selectedEdges;

    let headSelected = false;
    let tailSelected = false;

    for (const edge of edges) {
      if (edge % 2 === 0)
        headSelected = true;
      else
        tailSelected = true;
    }

    this.headCircle.color = headSelected ? 0xFF0000 : 0xFFFFFF;
    this.tailCircle.color = tailSelected ? 0xFF0000 : 0xFFFFFF;
  }
}
