import type { DependencyContainer } from 'osucad-framework';
import { OsucadConfigManager } from '@osucad/common';
import { dependencyLoader, Game, provide } from 'osucad-framework';
import { Fit, ScalingContainer } from '../editor/ScalingContainer';
import { ThemeColors } from '../editor/ThemeColors';
import { MainCursorContainer } from '../MainCursorContainer';
import { OsucadIcons } from '../OsucadIcons';
import { UIFonts } from '../UIFonts';
import { PlaygroundExplorer } from './PlaygroundExplorer';

@provide(Game)
export class PlaygroundGame extends Game {
  constructor() {
    super();
  }

  @dependencyLoader()
  async load(dependencies: DependencyContainer) {
    dependencies.provide(new ThemeColors());

    const config = new OsucadConfigManager();

    config.load();

    dependencies.provide(OsucadConfigManager, config);

    await Promise.all([
      UIFonts.load(),
      OsucadIcons.load(),
    ]);

    const content = new ScalingContainer({
      desiredSize: {
        x: 960,
        y: 768,
      },
      fit: Fit.Fill,
    });

    this.add(content);

    content.add(new PlaygroundExplorer());

    this.add(new MainCursorContainer());
  }
}
