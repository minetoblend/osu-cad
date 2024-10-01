import { Action, dependencyLoader } from 'osucad-framework';
import { Dialog } from '../modals/Dialog.ts';
import { OsucadSpriteText } from '../OsucadSpriteText.ts';
import { OsucadButton } from '../userInterface/OsucadButton.ts';

export class EditorExitDialog extends Dialog {
  constructor() {
    super('Exit');
  }

  @dependencyLoader()
  load() {
    this.mainContent.add(
      new OsucadSpriteText({
        text: 'You have unsaved changes, are you sure you want to exit?',
        color: this.colors.text,
        fontSize: 13,
      }),
    );

    this.buttons.addAll(
      new OsucadButton().withText('Save and exit').withAction(() => this.#exit(true)),
      new OsucadButton().withText('Discard changes').withAction(() => this.#exit(false)),
    );
  }

  #exit(shouldSave: boolean) {
    this.exitRequested.emit({ shouldSave });
    this.exit();
  }

  exitRequested = new Action<{ shouldSave: boolean }>();
}
