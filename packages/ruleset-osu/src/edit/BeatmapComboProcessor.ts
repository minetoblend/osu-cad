import type { HitObject } from '@osucad/core';
import { BeatmapProcessor, hasComboInformation } from '@osucad/core';
import { OsuHitObject } from '../hitObjects/OsuHitObject';
import { Spinner } from '../hitObjects/Spinner';

export class BeatmapComboProcessor extends BeatmapProcessor {
  override onHitObjectAdded(hitObject: HitObject) {
    super.onHitObjectAdded(hitObject);

    hitObject.startTimeBindable.valueChanged.addListener(this.state.invalidate, this.state);

    if (hitObject instanceof OsuHitObject) {
      hitObject.newComboBindable.valueChanged.addListener(this.state.invalidate, this.state);
      hitObject.comboOffsetBindable.valueChanged.addListener(this.state.invalidate, this.state);
    }
  }

  override onHitObjectRemoved(hitObject: HitObject) {
    super.onHitObjectRemoved(hitObject);

    hitObject.startTimeBindable.valueChanged.removeListener(this.state.invalidate, this.state);

    if (hitObject instanceof OsuHitObject) {
      hitObject.newComboBindable.valueChanged.removeListener(this.state.invalidate, this.state);
      hitObject.comboOffsetBindable.valueChanged.removeListener(this.state.invalidate, this.state);
    }
  }

  protected processBeatmap() {
    this.#calculateCombos();
  }

  #calculateCombos() {
    let comboIndex = 0;
    let indexInCombo = 0;

    let forceNewCombo = false;
    for (const hitObject of this.hitObjects) {
      if (!hasComboInformation(hitObject))
        continue;

      if (hitObject instanceof Spinner) {
        forceNewCombo = true;
      }

      else if ((hitObject.newCombo && hitObject !== this.beatmap.hitObjects.first) || forceNewCombo) {
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
