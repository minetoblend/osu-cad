import type { DependencyContainer } from '../../../framework/src';
import { dependencyLoader, Game } from '../../../framework/src';
import { Fit, ScalingContainer } from '../editor/ScalingContainer.ts';
import { ThemeColors } from '../editor/ThemeColors.ts';
import { MainCursorContainer } from '../MainCursorContainer.ts';
import { OsucadIcons } from '../OsucadIcons.ts';
import { UIFonts } from '../UIFonts.ts';
import { PlaygroundExplorer } from './PlaygroundExplorer.ts';

export class PlaygroundGame extends Game {
  constructor() {
    super();
  }

  @dependencyLoader()
  async load(dependencies: DependencyContainer) {
    dependencies.provide(new ThemeColors());

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
