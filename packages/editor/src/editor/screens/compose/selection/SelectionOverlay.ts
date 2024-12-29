import type { Constructor, OsuHitObject } from '@osucad/common';
import type { NoArgsConstructor } from 'osucad-framework';
import type { DrawableSelection } from './DrawableSelection';
import { HitCircle, HitObjectList, Slider } from '@osucad/common';
import { Axes, clamp, CompositeDrawable, Container, dependencyLoader, DrawablePool, resolved } from 'osucad-framework';
import { EditorSelection } from '../EditorSelection';
import { DrawableHitCircleSelection } from './DrawableHitCircleSelection';
import { DrawableSliderSelection } from './DrawableSliderSelection';

export class SelectionOverlay extends CompositeDrawable {
  @resolved(EditorSelection)
  selection!: EditorSelection;

  #objects = new Map<OsuHitObject, DrawableSelection>();

  #selectionContainer!: Container;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.#selectionContainer = new Container({
      relativeSizeAxes: Axes.Both,
    }));

    this.#selectionContainer.drawNode.enableRenderGroup();

    this.selection.selectionChanged.addListener(([hitObject, selected]) => {
      if (selected)
        this.#onSelected(hitObject);
      else
        this.#onDeselected(hitObject);
    });

    let circleCount = 0;
    let sliderCount = 0;

    for (const hitObject of this.hitObjects) {
      if (hitObject instanceof HitCircle)
        circleCount++;
      else if (hitObject instanceof Slider)
        sliderCount++;
    }

    this.registerPool(HitCircle, DrawableHitCircleSelection, 10, clamp(circleCount, 100, 500));
    this.registerPool(Slider, DrawableSliderSelection, 10, clamp(sliderCount, 100, 500));
  }

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  protected registerPool(
    hitObject: Constructor<OsuHitObject>,
    drawable: NoArgsConstructor<DrawableSelection>,
    initialSize: number,
    maximumSize?: number,
  ) {
    const pool = new DrawablePool<DrawableSelection>(drawable, initialSize, maximumSize);

    this.#pools.set(hitObject, pool);

    this.addInternal(pool);
  }

  #pools = new Map<Constructor<OsuHitObject>, DrawablePool<DrawableSelection>>();

  #onSelected(hitObject: OsuHitObject) {
    if (!this.#objects.has(hitObject)) {
      const drawable = this.#createDrawableRepresentation(hitObject);

      if (drawable) {
        this.#objects.set(hitObject, drawable);

        this.#selectionContainer.add(drawable);
      }
    }
  }

  #onDeselected(hitObject: OsuHitObject) {
    const drawable = this.#objects.get(hitObject);
    if (!drawable)
      return;

    this.#objects.delete(hitObject);

    drawable.hitObject = null;

    this.#selectionContainer.remove(drawable, false);
  }

  #createDrawableRepresentation(hitObject: OsuHitObject) {
    const pool = this.#getPool(hitObject);

    return pool?.get(((drawable) => {
      drawable.hitObject = hitObject;
      return drawable;
    }));
  }

  #getPool(hitObject: OsuHitObject) {
    return this.#pools.get(hitObject.constructor as Constructor<OsuHitObject>);
  }
}
