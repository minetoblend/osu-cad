import type { DrawableHitObject, IBeatmap, Playfield, PlayfieldAdjustmentContainer, Ruleset } from '@osucad/common';
import type { PassThroughInputManager, ReadonlyDependencyContainer } from 'osucad-framework';
import type { ManiaBeatmap } from '../beatmaps/ManiaBeatmap';
import type { ManiaHitObject } from '../objects/ManiaHitObject';
import { BarLineGenerator, DrawableScrollingRuleset, EffectPoint, ISkinSource, ScrollingDirection, ScrollVisualisationMethod } from '@osucad/common';
import { BarLine } from '../objects/BarLine';
import { PlayfieldType } from '../PlayfieldType';
import { ManiaInputManager } from './ManiaInputManager';
import { ManiaPlayfield } from './ManiaPlayfield';
import { ManiaPlayfieldAdjustmentContainer } from './ManiaPlayfieldAdjustmentContainer';

export class DrawableManiaRuleset extends DrawableScrollingRuleset<ManiaHitObject> {
  override get playfield(): ManiaPlayfield {
    return super.playfield as ManiaPlayfield;
  }

  override get beatmap(): ManiaBeatmap {
    return super.beatmap as ManiaBeatmap;
  }

  barLines: BarLine[] = [];

  constructor(ruleset: Ruleset, beatmap: IBeatmap<ManiaHitObject>) {
    super(ruleset, beatmap);

    this.barLines = new BarLineGenerator(
      beatmap,
      (startTime, major) => Object.assign(new BarLine(), { startTime, major }),
    ).barLines;

    this.timeRange.minValue = 1;
    this.timeRange.maxValue = 11485;
  }

  #currentSkin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#currentSkin = dependencies.resolve(ISkinSource);
    this.#currentSkin.sourceChanged.addListener(this.#onSkinChanged, this);
    this.#skinChanged();

    const isForCurrentRuleset = this.beatmap.beatmapInfo.ruleset.equals(this.ruleset.rulesetInfo);

    for (const p of this.controlPoints) {
      // Mania doesn't care about global velocity
      p.velocity = 1;
      p.baseBeatLength *= this.beatmap.difficulty.sliderMultiplier;

      // For non-mania beatmap, speed changes should only happen through timing points
      if (!isForCurrentRuleset)
        p.effectPoint = new EffectPoint();
    }

    this.barLines.forEach(b => this.playfield.addHitObject(b));

    // TODO: use config for this
    this.direction.value = ScrollingDirection.Down;
    this.timeRange.value = 11485 / 20;
    this.visualisationMethod = ScrollVisualisationMethod.Constant;
  }

  #onSkinChanged() {
    this.scheduler.addOnce(this.#skinChanged, this);
  }

  #skinChanged() {
    // TODO: get hitPosition from skin config
  }

  protected override get relativeScaleBeatLengths(): boolean {
    return true;
  }

  override createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer {
    return new ManiaPlayfieldAdjustmentContainer();
  }

  override createPlayfield(): Playfield {
    return new ManiaPlayfield(this.beatmap.stages);
  }

  get variant() {
    return (this.beatmap.stages.length === 1 ? PlayfieldType.Single : PlayfieldType.Dual) + this.beatmap.totalColumns;
  }

  override createDrawableRepresentation(hitObject: ManiaHitObject): DrawableHitObject | null {
    return null;
  }

  override createInputManager(): PassThroughInputManager {
    return new ManiaInputManager(this.ruleset.rulesetInfo, this.variant);
  }
}
