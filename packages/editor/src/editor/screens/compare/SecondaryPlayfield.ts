import type { DependencyContainer } from 'osucad-framework';
import type { DifficultyInfo } from '../../EditorBeatmap';
import { CompositeDrawable, dependencyLoader } from 'osucad-framework';
import { Beatmap } from '../../../beatmap/Beatmap';
import { BeatmapComboProcessor } from '../../../beatmap/beatmapProcessors/BeatmapComboProcessor';
import { BeatmapStackingProcessor } from '../../../beatmap/beatmapProcessors/BeatmapStackingProcessor';
import { EditorJudgeProvider } from '../../hitobjects/EditorJudge';
import { OsuPlayfield } from '../../hitobjects/OsuPlayfield';

export class SecondaryPlayfield extends CompositeDrawable {
  constructor(readonly difficulty: DifficultyInfo) {
    super();
  }

  @dependencyLoader()
  async load(dependencies: DependencyContainer) {
    this.width = 512;
    this.height = 384;

    const beatmap = await this.difficulty.load();

    dependencies.provide(Beatmap, beatmap);

    this.addAllInternal(
      this.comboProcessor = new BeatmapComboProcessor(),
      new BeatmapStackingProcessor(),
      new OsuPlayfield()
        .withCustomJudgeProvider(new EditorJudgeProvider())
        .adjust((it) => {
          it.showJudgements = false;
          it.suppressHitSounds = true;
          it.hitObjectsAlwaysHit = true;
        }),
    );
  }

  comboProcessor!: BeatmapComboProcessor;
}
