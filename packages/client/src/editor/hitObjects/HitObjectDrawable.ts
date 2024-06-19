import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable.ts';
import { Beatmap, HitObject, Vec2 } from '@osucad/common';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader.ts';

export class HitObjectDrawable<
  T extends HitObject = HitObject,
> extends ContainerDrawable {
  constructor(public hitObject: T) {
    super();
    this.hitObject.onUpdate.addListener(this.#onHitObjectUpdate);
  }

  needsSetup = false;

  #onHitObjectUpdate = () => {
    this.needsSetup = true;
  };

  @resolved(Beatmap)
  beatmap!: Beatmap;

  comboColor = 0xffffff;

  @dependencyLoader()
  load() {
    this.setup();
  }

  setup() {
    this.scale = new Vec2(this.hitObject.scale);
    this.position = this.hitObject.stackedPosition;
    const comboColors = this.beatmap.colors;
    this.comboColor =
      comboColors[this.hitObject.comboIndex % comboColors.length];
  }

  onTick() {
    if (this.needsSetup) {
      this.setup();
      this.needsSetup = false;
    }
  }

  destroy() {
    this.hitObject.onUpdate.removeListener(this.#onHitObjectUpdate);
    super.destroy();
  }
}
