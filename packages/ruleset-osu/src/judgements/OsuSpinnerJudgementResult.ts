import { OsuJudgementResult } from "./OsuJudgementResult";
import { SpinnerSpinHistory } from "../skinning/legacy/SpinnerSpinHistory";
import type { Spinner } from "../hitObjects/Spinner";

export class OsuSpinnerJudgementResult extends OsuJudgementResult
{
  declare public hitObject: Spinner;

  public get totalRotation()
  {
    return this.history.totalRotation;
  }

  public readonly history = new SpinnerSpinHistory();

  public timeStarted?: number;
}
