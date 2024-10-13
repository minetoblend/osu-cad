import type { FillFlowContainer } from 'osucad-framework';
import { ComboColorSelect } from './ComboColorSelect';
import { SetupScreenSection } from './SetupScreenSection';

export class ColorsSection extends SetupScreenSection {
  constructor() {
    super('Colors');
  }

  protected createContent(container: FillFlowContainer): void {
    container.add(new ComboColorSelect());
  }
}
