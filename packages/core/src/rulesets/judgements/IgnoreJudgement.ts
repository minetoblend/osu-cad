import { HitResult } from '../../hitObjects/HitResult';
import { Judgement } from './Judgement';

export class IgnoreJudgement extends Judgement {
  override get maxResult(): HitResult {
    return HitResult.IgnoreHit;
  }
}
