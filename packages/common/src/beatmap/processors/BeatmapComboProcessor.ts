import type { OsuHitObject } from '../../rulesets/osu/hitObjects/OsuHitObject';
import { Color, type ReadonlyDependencyContainer, resolved } from 'osucad-framework';
import { hasComboInformation } from '../../hitObjects/IHasComboInformation';
import { Spinner } from '../../rulesets/osu/hitObjects/Spinner';
import { ISkinSource } from '../../skinning/ISkinSource';
import { SkinConfig } from '../../skinning/SkinConfig';
import { BeatmapProcessor } from './BeatmapProcessor';

export class BeatmapComboProcessor extends BeatmapProcessor {
  override onHitObjectAdded(hitObject: OsuHitObject) {
    super.onHitObjectAdded(hitObject);
    hitObject.newComboBindable.valueChanged.addListener(this.state.invalidate, this.state);
    hitObject.comboOffsetBindable.valueChanged.addListener(this.state.invalidate, this.state);
    hitObject.startTimeBindable.valueChanged.addListener(this.state.invalidate, this.state);
  }

  override onHitObjectRemoved(hitObject: OsuHitObject) {
    super.onHitObjectRemoved(hitObject);

    hitObject.newComboBindable.valueChanged.removeListener(this.state.invalidate, this.state);
    hitObject.comboOffsetBindable.valueChanged.removeListener(this.state.invalidate, this.state);
    hitObject.startTimeBindable.valueChanged.removeListener(this.state.invalidate, this.state);
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

      hitObject.comboColor = this.getComboColor(comboIndex);
      hitObject.comboIndex = comboIndex;
      hitObject.indexInCombo = indexInCombo;

      indexInCombo++;
    }
  }

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  #skinComboColors: readonly Color[] = [];

  #comboColorsOverride: Color[] | null = null;

  get comboColorsOverride() {
    return this.#comboColorsOverride;
  }

  set comboColorsOverride(value: Color[] | null) {
    if (value === this.#comboColorsOverride)
      return;

    this.#comboColorsOverride = value;
    this.#skinChanged();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.skin.sourceChanged.addListener(this.#skinChanged, this);
    this.#skinChanged();
  }

  #skinChanged() {
    this.#skinComboColors = this.skin.getConfig(SkinConfig.ComboColors) ?? [];
    this.state.invalidate();
  }

  protected getComboColor(comboIndex: number) {
    if (this.#comboColorsOverride !== null)
      return this.#comboColorsOverride[comboIndex % this.#comboColorsOverride.length];

    if (this.#skinComboColors.length > 0)
      return this.#skinComboColors[comboIndex % this.#skinComboColors.length];

    return new Color(0xFFFFFF);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.skin.sourceChanged.removeListener(this.#skinChanged, this);
  }
}
