import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable.ts';
import { resolved } from '@/framework/di/DependencyLoader.ts';
import {
  HitCircle,
  HitObjectManager,
  HitObjectType,
  Slider,
} from '@osucad/common';
import { Axes } from '@/framework/drawable/Axes.ts';
import { EditorClock } from '@/editor/EditorClock.ts';
import { Drawable } from '@/framework/drawable/Drawable.ts';
import { HitCircleDrawable } from '@/editor/hitObjects/HitCircleDrawable.ts';
import { SliderDrawable } from '@/editor/hitObjects/SliderDrawable.ts';

export class HitObjectContainer extends ContainerDrawable {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
    this.add(this.hitObjectContainer);
  }

  @resolved(HitObjectManager)
  hitObjects!: HitObjectManager;

  @resolved(EditorClock)
  clock!: EditorClock;

  hitObjectContainer = new ContainerDrawable({
    relativeSizeAxes: Axes.Both,
  });

  get currentTime() {
    return this.clock.currentTimeAnimated;
  }

  private readonly hitObjectDrawableMap = new Map<string, Drawable>();

  update() {
    super.update();

    let startIndex = this.hitObjects.hitObjects.findIndex(
      (h) => h.endTime + 700 > this.currentTime,
    );
    let endIndex = this.hitObjects.hitObjects.findIndex(
      (h) => h.startTime - 600 > this.currentTime,
    );

    if (startIndex > 0) startIndex--;
    if (endIndex == -1) endIndex = this.hitObjects.hitObjects.length;
    if (endIndex < this.hitObjects.hitObjects.length) endIndex++;
    if (startIndex === -1) startIndex = this.hitObjects.hitObjects.length - 1;

    const hitObjects = this.hitObjects.hitObjects.filter(
      (h, i) => (i >= startIndex && i <= endIndex) || h.isSelected,
    );

    const shouldRemove = new Set<string>([...this.hitObjectDrawableMap.keys()]);
    for (let i = 0; i < hitObjects.length; i++) {
      const hitObject = hitObjects[i];
      shouldRemove.delete(hitObject.id);
      let drawable = this.hitObjectDrawableMap.get(hitObject.id);
      if (!drawable) {
        switch (hitObject.type) {
          case HitObjectType.Circle:
            drawable = new HitCircleDrawable(hitObject as HitCircle);
            break;
          case HitObjectType.Slider:
            drawable = new SliderDrawable(hitObject as Slider);
            break;
          // case HitObjectType.Spinner:
          //   drawable = new SpinnerDrawable(hitObject as Spinner);
          //   break;
          default:
            continue;
        }

        this.hitObjectDrawableMap.set(hitObject.id, drawable);
        this.hitObjectContainer.add(drawable);
      }
      drawable.zIndex = hitObjects.length - i;
    }

    for (const hitObject of shouldRemove) {
      const drawable = this.hitObjectDrawableMap.get(hitObject);
      if (drawable) {
        this.hitObjectDrawableMap.delete(hitObject);
        drawable.destroy();
      }
    }
  }
}
