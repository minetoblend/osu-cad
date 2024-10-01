import type { KeyDownEvent } from '../../../framework/src';
import { dependencyLoader, Key } from '../../../framework/src';
import { Playground } from '../playground/Playground.ts';
import { Dialog } from './Dialog.ts';
import { DialogContainer } from './DialogContainer.ts';

export class DialogPlayground extends Playground {
  @dependencyLoader()
  load() {
    this.add(this.dialogContainer = new DialogContainer());
  }

  dialogContainer!: DialogContainer;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Space) {
      this.dialogContainer.showDialog(new Dialog('Hello World'));
      return true;
    }

    return false;
  }
}
