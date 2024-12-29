import type { ClickEvent } from 'osucad-framework';
import { EditorTextButton } from './EditorTextButton';

export class SimpleEditorTextButton extends EditorTextButton {
  constructor(text: string, readonly action: () => void) {
    super(text);
  }

  override onClick(e: ClickEvent): boolean {
    this.action();
    return true;
  }
}
