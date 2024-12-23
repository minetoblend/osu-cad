import type { ClickEvent } from 'osucad-framework';
import { ToolbarButton } from './ToolbarButton';

export abstract class ToolbarToggleButton extends ToolbarButton {
  override onClick(e: ClickEvent): boolean {
    this.active.toggle();
    return true;
  }
}
