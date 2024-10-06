import type { DependencyContainer } from 'osucad-framework';
import type { DifficultyInfo } from '../../context/EditorContext.ts';
import { CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { Beatmap } from '../../../beatmap/Beatmap.ts';
import { BeatmapComboProcessor } from '../../../beatmap/beatmapProcessors/BeatmapComboProcessor.ts';
import { BeatmapStackingProcessor } from '../../../beatmap/beatmapProcessors/BeatmapStackingProcessor.ts';
import { EditorContext } from '../../context/EditorContext.ts';
import { OsuPlayfield } from '../../hitobjects/OsuPlayfield.ts';

export class SecondaryPlayfield extends CompositeDrawable {
  constructor(readonly difficulty: DifficultyInfo) {
    super();
  }

  @resolved(EditorContext)
  context!: EditorContext;

  @dependencyLoader()
  async load(dependencies: DependencyContainer) {
    this.width = 512;
    this.height = 384;

    const beatmap = await this.difficulty.load();

    dependencies.provide(Beatmap, beatmap);

    this.addAllInternal(
      new BeatmapComboProcessor(),
      new BeatmapStackingProcessor(),
      new OsuPlayfield(),
    );
  }
}
