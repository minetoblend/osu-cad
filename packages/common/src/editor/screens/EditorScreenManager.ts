import type { EditorScreen } from './EditorScreen';
import { Bindable, Component } from 'osucad-framework';
import { getEditorScreenMetadata } from './metadata';

export interface EditorScreenEntry {
  readonly id: string;
  readonly name: string;
  readonly drawable: new () => EditorScreen;
}

export class EditorScreenManager extends Component {
  entries: EditorScreenEntry[] = [];

  register(screen: new () => EditorScreen) {
    const metadata = getEditorScreenMetadata(screen);

    if (!metadata)
      throw new Error(`Screen ${screen.name} is not decorated with @editorScreen`);

    if (this.entries.some(it => it.id === metadata.id)) {
      console.warn(`Screen with id ${metadata.id} already registered`);
      return;
    }

    const screenType: EditorScreenEntry = {
      ...metadata,
      drawable: screen,
    };

    this.entries.push(screenType);
  }

  readonly currentScreen = new Bindable<EditorScreenEntry>(null!);

  setCurrentScreen(screen: new () => EditorScreen) {
    const entry = this.entries.find(it => it.drawable === screen);
    if (entry)
      this.currentScreen.value = entry;
    else
      throw new Error(`Screen ${screen.name} is not registered`);
  }

  override update() {
    super.update();

    if (this.currentScreen.value === null)
      this.currentScreen.value = this.entries[0];
  }
}
