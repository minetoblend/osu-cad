import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { EditorScreen, editorScreen, OsucadColors } from '@osucad/core';
import { Axes, Box, Container } from '@osucad/framework';
import { PlaceComposer } from './PlaceComposer';
import { PlacementCountdown } from './PlacementCountdown';

@editorScreen({
  id: 'place',
  name: 'Place',
})
export class PlaceScreen extends EditorScreen {
  composer!: PlaceComposer;

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChildren = [
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 80 },
        child: this.composer = new PlaceComposer(),
      }),
      new PlacementCountdown(),
    ];

    this.addInternal(
      new Container({
        autoSizeAxes: Axes.Y,
        relativeSizeAxes: Axes.X,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: OsucadColors.translucent,
            alpha: 0.5,
          }),
          this.composer.topBar,
        ],
      }),
    );
  }
}
