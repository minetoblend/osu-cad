import type { Drawable } from 'osucad-framework';
import { CursorContainer } from 'osucad-framework';
import { GameplayCursor } from '../editor/screens/compose/gameplayVisualizer/GameplayCursor';

export class GameplayCursorContainer extends CursorContainer {
  createCursor(): Drawable {
    return new GameplayCursor();
  }
}
