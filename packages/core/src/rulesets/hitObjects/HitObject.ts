import { Bindable } from "@osucad/framework";
import { BeatmapDifficultyInfo } from "../../beatmaps/BeatmapDifficultyInfo";

export class HitObject 
{
  readonly startTimeBindable = new Bindable(0);

  get startTime() 
  {
    return this.startTimeBindable.value;
  }

  set startTime(value) 
  {
    this.startTimeBindable.value = value;
  }

  get duration() 
  {
    return 0;
  }

  get endTime() 
  {
    return this.startTime + this.duration;
  }

  applyDefaults(difficulty: BeatmapDifficultyInfo) 
  {
  }
}
