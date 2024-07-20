import type { Drawable, GameHost, ScreenTransitionEvent } from 'osucad-framework';
import { GAME_HOST, ScreenStack, resolved } from 'osucad-framework';
import { OsucadScreen } from '../OsucadScreen';
import type { EditorContext } from './context/EditorContext';
import { OnlineEditorContext } from './context/OnlineEditorContext';

export class EditorLoader extends OsucadScreen {
  constructor(
    readonly context: EditorContext,
    background?: Drawable,
  ) {
    super();

    if (background)
      this.addInternal(background);
  }

  @resolved(GAME_HOST)
  gameHost!: GameHost;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeIn({ duration: 500, easing: 'power3.out' });

    const screenStack = this.findClosestParentOfType(ScreenStack);
    if (!screenStack) {
      throw new Error('EditorLoader must be a child of a ScreenStack');
    }

    import('./Editor').then(({ Editor }) => {
      this.screenStack.push(new Editor(this.context));
    });
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.exit();
  }

  getPath(): string {
    if (this.context instanceof OnlineEditorContext) {
      return `/edit/${this.context.joinKey}`;
    }

    return '/edit';
  }
}
