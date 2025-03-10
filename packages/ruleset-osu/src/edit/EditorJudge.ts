import type { DrawableHitObject, IHitObjectJudgeProvider } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { DrawableOsuHitObject } from '../hitObjects/drawables/DrawableOsuHitObject';
import { HitObjectJudge, OsucadConfigManager, OsucadSettings } from '@osucad/core';
import { BindableNumber } from '@osucad/framework';

export class EditorJudge extends HitObjectJudge {
  constructor(hitObject: DrawableHitObject) {
    super(hitObject);
  }

  hitSoundOffset = new BindableNumber();

  audioOffset = new BindableNumber();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.AudioOffset, this.audioOffset);
    config.bindWith(OsucadSettings.HitSoundOffset, this.hitSoundOffset);
  }

  checkForResult(hitObject: DrawableHitObject, userTriggered: boolean, timeOffset: number) {
    if (this.time.current > hitObject.hitObject!.endTime)
      (hitObject as DrawableOsuHitObject).hitForcefully(-(this.audioOffset.value + this.hitSoundOffset.value));
  }
}

export class EditorJudgeProvider implements IHitObjectJudgeProvider {
  getJudge(hitObject: DrawableHitObject): HitObjectJudge | null {
    return new EditorJudge(hitObject);
  }
}
