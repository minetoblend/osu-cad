import type { Judgement } from '@osucad/core';
import { ManiaJudgement } from '../judgements/ManiaJudgement';
import { ManiaHitObject } from './ManiaHitObject';

export class Note extends ManiaHitObject {
  override createJudgement(): Judgement {
    return new ManiaJudgement();
  }
}
