import type { EditorBottomBar } from '@osucad/editor/editor/EditorBottomBar';
import type { EditorTopBar } from '@osucad/editor/editor/EditorTopBar';
import type { EditorScreen } from '@osucad/editor/editor/screens/EditorScreen';
import type { MultiplayerEditorBeatmap } from '@osucad/multiplayer';
import type { DependencyContainer, ReadonlyDependencyContainer } from 'osucad-framework';
import { Editor } from '@osucad/editor';
import { ComposeScreen } from '@osucad/editor/editor/screens/compose/ComposeScreen';
import { Chat, ConnectedUsers, MultiplayerClient } from '@osucad/multiplayer';
import { ChatOverlay } from './chat/ChatOverlay';
import { ConnectedUsersList } from './ConnectedUsersList';
import { MultiplayerCursorContainer } from './MultiplayerCursorContainer';

export class MultiplayerEditor extends Editor {
  constructor(editorBeatmap: MultiplayerEditorBeatmap) {
    super(editorBeatmap);
  }

  override editorBeatmap!: MultiplayerEditorBeatmap;

  protected createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    const dependencies = super.createChildDependencies(parentDependencies);

    const client = this.editorBeatmap.client;

    dependencies.provide(MultiplayerClient, client);
    dependencies.provide(ConnectedUsers, client.connectedUsers);
    dependencies.provide(Chat, client.chat);

    return dependencies;
  }

  protected override createTopBar(): EditorTopBar {
    return super.createTopBar().doWhenLoaded(it => it.add(new ConnectedUsersList()));
  }

  protected override createBottomBar(): EditorBottomBar {
    return super.createBottomBar().doWhenLoaded(it => it.add(new ChatOverlay().with({ depth: 1 })));
  }

  protected prepareScreen(screen: EditorScreen): EditorScreen {
    if (!screen)
      return screen;

    if (screen instanceof ComposeScreen) {
      screen.doWhenLoaded(() => {
        screen.composer.add(
          new MultiplayerCursorContainer('compose'),
        );
      });
    }

    return screen;
  }
}
