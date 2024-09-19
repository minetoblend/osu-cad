import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { Color, resolved } from 'osucad-framework';
import { ISkinSource } from '../../skinning/ISkinSource';
import { Spinner } from '../hitObjects/Spinner';
import { BeatmapProcessor } from './BeatmapProcessor';

export class BeatmapComboProcessor extends BeatmapProcessor {
  onHitObjectAdded(hitObject: OsuHitObject) {
    super.onHitObjectAdded(hitObject);

    hitObject.newComboBindable.valueChanged.addListener(this.state.invalidate, this.state);
    hitObject.comboOffsetBindable.valueChanged.addListener(this.state.invalidate, this.state);
    hitObject.startTimeBindable.valueChanged.addListener(this.state.invalidate, this.state);
  }

  onHitObjectRemoved(hitObject: OsuHitObject) {
    super.onHitObjectRemoved(hitObject);

    hitObject.newComboBindable.valueChanged.removeListener(this.state.invalidate);
    hitObject.comboOffsetBindable.valueChanged.removeListener(this.state.invalidate);
    hitObject.startTimeBindable.valueChanged.removeListener(this.state.invalidate);
  }

  protected processBeatmap() {
    this.#calculateCombos();
  }

  #calculateCombos() {
    let comboIndex = 0;
    let indexInCombo = 0;

    let forceNewCombo = false;
    for (const hitObject of this.hitObjects) {
      if (hitObject instanceof Spinner) {
        forceNewCombo = true;
      }
      else if ((hitObject.newCombo && hitObject !== this.beatmap.hitObjects.first) || forceNewCombo) {
        comboIndex += 1 + hitObject.comboOffset;
        indexInCombo = 0;

        forceNewCombo = false;
      }

      hitObject.comboColor = this.getComboColor(comboIndex);
      hitObject.comboIndex = comboIndex;
      hitObject.indexInCombo = indexInCombo;

      indexInCombo++;
    }
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected getComboColor(comboIndex: number) {
    if (this.beatmap.colors.comboColors.length > 0)
      return this.beatmap.colors.getComboColor(comboIndex);

    return new Color(0xFFFFFF);
  }
}
