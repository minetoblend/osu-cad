import type { DrawableHitObject } from './DrawableHitObject';
import { Component, injectionToken } from '@osucad/framework';

export abstract class HitObjectJudge<T extends DrawableHitObject = DrawableHitObject> extends Component {
  protected constructor(readonly drawableHitObject: T) {
    super();
  }

  get hitObject() {
    return this.drawableHitObject.hitObject!;
  }

  abstract checkForResult(hitObject: T, userTriggered: boolean, timeOffset: number): void;
}

export interface IHitObjectJudgeProvider {
  getJudge(hitObject: DrawableHitObject): HitObjectJudge | null;
}

// eslint-disable-next-line ts/no-redeclare
export const IHitObjectJudgeProvider = injectionToken<IHitObjectJudgeProvider>();
