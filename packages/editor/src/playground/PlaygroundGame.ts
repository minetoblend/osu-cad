import { DependencyContainer, provide } from '../../../framework/src';
import { dependencyLoader, Game } from '../../../framework/src';
import { Fit, ScalingContainer } from '../editor/ScalingContainer';
import { ThemeColors } from '../editor/ThemeColors';
import { MainCursorContainer } from '../MainCursorContainer';
import { OsucadIcons } from '../OsucadIcons';
import { UIFonts } from '../UIFonts';
import { PlaygroundExplorer } from './PlaygroundExplorer';
import { OsucadConfigManager } from '../config/OsucadConfigManager';

@provide(Game)
export class PlaygroundGame extends Game {
  constructor() {
    super();
  }

  @dependencyLoader()
  async load(dependencies: DependencyContainer) {
    dependencies.provide(new ThemeColors());

    const config = new OsucadConfigManager()

    config.load()

    dependencies.provide(OsucadConfigManager, config)

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
