import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { EditorScreen, editorScreen } from '@osucad/core';
import { PlaceComposer } from './PlaceComposer';
import { PlacementCountdown } from './PlacementCountdown';

@editorScreen({
  id: 'place',
  name: 'Place',
})
export class PlaceScreen extends EditorScreen {
  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChildren = [
      new PlaceComposer(),
      new PlacementCountdown(),
    ];
  }
}
