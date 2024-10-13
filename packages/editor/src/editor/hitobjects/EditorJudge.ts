import type { DependencyContainer } from '../../../../framework/src';
import type { DrawableHitObject } from './DrawableHitObject';
import type { DrawableOsuHitObject } from './DrawableOsuHitObject';
import type { IHitObjectJudgeProvider } from './HitObjectJudge';
import { BindableNumber, dependencyLoader } from '../../../../framework/src';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { HitObjectJudge } from './HitObjectJudge';

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
