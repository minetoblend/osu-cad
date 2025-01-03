import type { ModPostBlueprint } from './ModPostBlueprint';
import type { ModPostObject } from './ModPostObject';
import { Axes, CompositeDrawable, resolved } from 'osucad-framework';
import { ModPost } from './ModPost';

export class ModPostBlueprintContainer extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  readonly #drawableMap = new Map<ModPostObject, ModPostBlueprint>();

  @resolved(ModPost)
  modPost!: ModPost;

  protected override loadComplete() {
    super.loadComplete();

    this.modPost.added.addListener(this.addObject, this);
    this.modPost.removed.addListener(this.removeObject, this);

    for (const object of this.modPost.objects)
      this.addObject(object);
  }

  addObject(object: ModPostObject) {
    const blueprint = object.createBlueprint();
    this.#drawableMap.set(object, blueprint);
    this.addInternal(blueprint);
  }

  removeObject(object: ModPostObject) {
    const drawable = this.#drawableMap.get(object);
    if (!drawable)
      return false;

    drawable.expire();
    this.#drawableMap.delete(object);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.modPost.added.removeListener(this.addObject, this);
    this.modPost.removed.removeListener(this.removeObject, this);
  }
}
