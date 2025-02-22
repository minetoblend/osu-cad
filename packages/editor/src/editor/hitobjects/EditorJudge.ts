import type { DrawableHitObject, DrawableOsuHitObject, IHitObjectJudgeProvider } from '@osucad/common';
import type { DependencyContainer } from 'osucad-framework';
import { HitObjectJudge, OsucadConfigManager, OsucadSettings } from '@osucad/common';
import { BindableNumber, dependencyLoader } from 'osucad-framework';

export class EditorJudge extends HitObjectJudge {
  constructor(hitObject: DrawableHitObject) {
    super(hitObject);
  }

  hitSoundOffset = new BindableNumber();

  audioOffset = new BindableNumber();

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.AudioOffset, this.audioOffset);
    config.bindWith(OsucadSettings.HitSoundOffset, this.hitSoundOffset);
  }

  checkForResult(hitObject: DrawableHitObject, userTriggered: boolean, timeOffset: number) {
    (hitObject as DrawableOsuHitObject).hitForcefully(-(this.audioOffset.value + this.hitSoundOffset.value));
  }
}

export class EditorJudgeProvider implements IHitObjectJudgeProvider {
  getJudge(hitObject: DrawableHitObject): HitObjectJudge | null {
    return new EditorJudge(hitObject);
  }
}
