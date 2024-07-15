import type { HitObject } from '@osucad/common';
import { Beatmap } from '@osucad/common';
import { Container, dependencyLoader, resolved } from 'osucad-framework';

export class DrawableHitObject<
  T extends HitObject = HitObject,
> extends Container {
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

  comboColor = 0xFFFFFF;

  @dependencyLoader()
  load() {
    this.setup();
  }

  setup() {
    this.scale = this.hitObject.scale;
    this.position = this.hitObject.stackedPosition;
    const comboColors = this.beatmap.colors;
    if (comboColors.length > 0) {
      this.comboColor
        = comboColors[this.hitObject.comboIndex % comboColors.length];
    }
    else {
      this.comboColor = 0xFFFFFF;
    }
  }

  update() {
    super.update();

    if (this.needsSetup) {
      this.setup();
      this.needsSetup = false;
    }
  }

  override dispose(): boolean {
    this.hitObject.onUpdate.removeListener(this.#onHitObjectUpdate);

    return super.dispose();
  }
}
