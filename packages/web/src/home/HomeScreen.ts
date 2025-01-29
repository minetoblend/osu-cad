import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { ColorProvider, OsucadScreen, OsucadSpriteText } from '@osucad/core';
import { Axes, Box } from '@osucad/framework';

export class HomeScreen extends OsucadScreen {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const colors = dependencies.resolve(ColorProvider);

    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: colors.background1,
      }),
    );

    this.addInternal(new OsucadSpriteText({
      text: 'Home',
    }));
  }
}
