import type { HitCircle, Slider } from '@osucad/common';
import { Beatmap, HitObjectType } from '@osucad/common';
import type {
  Drawable,
} from 'osucad-framework';
import {
  Axes,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { EditorClock } from '../EditorClock';
import { DrawableHitCircle } from './DrawableHitCircle';
import { DrawableSlider } from './DrawableSlider';
import { FollowPointRenderer } from './FollowPointRenderer';

export class HitObjectContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  get hitObjects() {
    return this.beatmap.hitObjects;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #hitObjectContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  #followPointRenderer = new FollowPointRenderer();

  @dependencyLoader()
  load() {
    this.clock = this.#hitObjectContainer.clock = this.editorClock;
    this.processCustomClock = false;

    this.add(this.#followPointRenderer);
    this.add(this.#hitObjectContainer);
    this.#hitObjectContainer.drawNode.enableRenderGroup();

    this.hitObjects.onUpdated.addListener(([hitObject, type]) => {
      if (type === 'startTime') {
        const drawable = this.hitObjectDrawableMap.get(hitObject.id);

        if (drawable) {
          this.#hitObjectContainer.changeChildDepth(drawable, hitObject.startTime);
        }
      }
    });
  }

  private readonly hitObjectDrawableMap = new Map<string, Drawable>();

  update() {
    super.update();

    let startIndex = this.hitObjects.hitObjects.findIndex(
      h => h.endTime + 700 > this.time.current,
    );
    let endIndex = this.hitObjects.hitObjects.findIndex(
      h => h.startTime - 600 > this.time.current,
    );

    if (startIndex > 0)
      startIndex--;
    if (endIndex === -1)
      endIndex = this.hitObjects.hitObjects.length;
    if (endIndex < this.hitObjects.hitObjects.length)
      endIndex++;
    if (startIndex === -1)
      startIndex = this.hitObjects.hitObjects.length - 1;

    const hitObjects = this.hitObjects.hitObjects.filter(
      (h, i) => i >= startIndex && i <= endIndex,
    );

    this.#followPointRenderer.updateFollowPoints(hitObjects);

    const shouldRemove = new Set<string>([...this.hitObjectDrawableMap.keys()]);
    for (let i = 0; i < hitObjects.length; i++) {
      const hitObject = hitObjects[i];
      shouldRemove.delete(hitObject.id);
      let drawable = this.hitObjectDrawableMap.get(hitObject.id);
      if (!drawable) {
        switch (hitObject.type) {
          case HitObjectType.Circle:
            drawable = new DrawableHitCircle(hitObject as HitCircle);
            break;
          case HitObjectType.Slider:
            drawable = new DrawableSlider(hitObject as Slider);
            break;
          // case HitObjectType.Spinner:
          //   drawable = new SpinnerDrawable(hitObject as Spinner);
          //   break;
          default:
            continue;
        }

        drawable.depth = hitObject.startTime;

        this.hitObjectDrawableMap.set(hitObject.id, drawable);
        this.#hitObjectContainer.add(drawable);
      }
    }

    for (const hitObject of shouldRemove) {
      const drawable = this.hitObjectDrawableMap.get(hitObject);
      if (drawable) {
        this.hitObjectDrawableMap.delete(hitObject);
        this.#hitObjectContainer.remove(drawable, true);
      }
    }
  }
}
