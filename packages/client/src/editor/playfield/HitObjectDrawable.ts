import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable.ts';
import { Beatmap, HitObject, HitObjectUpdateType, Vec2 } from '@osucad/common';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader.ts';

export class HitObjectDrawable<
  T extends HitObject = HitObject,
> extends ContainerDrawable {
  constructor(public hitObject: T) {
    super();
    this.position = new Vec2(
      hitObject.stackedPosition.x,
      hitObject.stackedPosition.y,
    );
  }

  _onUpdate = (type: HitObjectUpdateType) => {
    this.onUpdate(type);
  };

  @resolved(Beatmap)
  beatmap!: Beatmap;

  comboColor = 0xffffff;

  @dependencyLoader()
  load() {
    this.setup();
  }

  setup() {
    // this.scale = new Vec2(this.hitObject.scale);
    const comboColors = this.beatmap.colors;
    this.comboColor =
      comboColors[this.hitObject.comboIndex % comboColors.length];
  }

  onUpdate(type: HitObjectUpdateType) {
    if (type === 'position') {
      this.position = new Vec2(
        this.hitObject.stackedPosition.x,
        this.hitObject.stackedPosition.y,
      );
    }
  }

  destroy() {
    this.hitObject.onUpdate.removeListener(this._onUpdate);
    super.destroy();
  }
}
