import type { IBeatmap } from '../../beatmap/IBeatmap';
import { hasComboInformation } from '../../hitObjects/IHasComboInformation';
import { Spinner } from './hitObjects/Spinner';

export class ComboProcessor {
  applyToBeatmap(beatmap: IBeatmap) {
    let comboIndex = 0;
    let indexInCombo = 0;

    let forceNewCombo = false;
    for (const hitObject of beatmap.hitObjects) {
      if (!hasComboInformation(hitObject))
        continue;

      if (hitObject instanceof Spinner) {
        forceNewCombo = true;
      }
      else if ((hitObject.newCombo && hitObject !== beatmap.hitObjects.first) || forceNewCombo) {
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
