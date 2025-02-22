import type { FillFlowContainer } from 'osucad-framework';
import { Beatmap, UpdateDifficultyCommand } from '@osucad/common';
import { resolved } from 'osucad-framework';
import { LabelledSliderControl } from '../../../userInterface/LabelledSliderControl';
import { CommandManager } from '../../context/CommandManager';
import { SetupScreenSection } from './SetupScreenSection';

export class DifficultySection extends SetupScreenSection {
  constructor() {
    super('Difficulty');
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  protected createContent(container: FillFlowContainer): void {
    const difficulty = this.beatmap.difficulty;

    container.addAll(
      new LabelledSliderControl('Drain Rate')
        .bindWithCommandManager(difficulty.hpDrainRateBindable, value => new UpdateDifficultyCommand({ hpDrainRate: value }))
        .adjust(it => it.commitImmediately = true, true),
      new LabelledSliderControl('Circle Size')
        .bindWithCommandManager(difficulty.circleSizeBindable, value => new UpdateDifficultyCommand({ circleSize: value }))
        .adjust(it => it.commitImmediately = true, true),
      new LabelledSliderControl('Approach Rate')
        .bindWithCommandManager(difficulty.approachRateBindable, value => new UpdateDifficultyCommand({ approachRate: value }))
        .adjust(it => it.commitImmediately = true, true),
      new LabelledSliderControl('Overall Difficulty')
        .bindWithCommandManager(difficulty.overallDifficultyBindable, value => new UpdateDifficultyCommand({ overallDifficulty: value }))
        .adjust(it => it.commitImmediately = true, true),
      new LabelledSliderControl('Slider Velocity')
        .bindWithCommandManager(difficulty.sliderMultiplierBindable, value => new UpdateDifficultyCommand({ sliderMultiplier: value }))
        .adjust(it => it.commitImmediately = true, true),
    );
  }
}
