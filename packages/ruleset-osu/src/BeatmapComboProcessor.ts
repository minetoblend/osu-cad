import { Beatmap, BeatmapPostProcessor } from "@osucad/core";
import { OsuHitObject } from "./hitObjects/OsuHitObject";

export class BeatmapComboProcessor implements BeatmapPostProcessor 
{
  public applyToBeatmap(beatmap: Beatmap) 
  {
    const hitObjects = beatmap.hitObjects as OsuHitObject[];

    let comboIndex = 0;
    let indexInCombo = 0;

    let forceNewCombo = false;
    const isSpinner: boolean = false; // TODO

    for (const hitObject of hitObjects) 
    {
      if (isSpinner) 
      {
        forceNewCombo = true;
      }
      else if ((hitObject.newCombo && hitObject !== beatmap.hitObjects[0]) || forceNewCombo) 
      {
        comboIndex += 1 + hitObject.comboOffset;
        indexInCombo = 0;

        forceNewCombo = false;
      }

      hitObject.comboIndex = comboIndex;
      hitObject.indexInCombo = indexInCombo;

      indexInCombo++;
    }
  }
}
