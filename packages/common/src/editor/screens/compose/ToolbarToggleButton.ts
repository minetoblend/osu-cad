import type { ClickEvent } from 'osucad-framework';
import { EditorButton } from './EditorButton';

export abstract class ToolbarToggleButton extends EditorButton {
  override onClick(e: ClickEvent): boolean {
    this.active.toggle();
    return true;
  }
}
