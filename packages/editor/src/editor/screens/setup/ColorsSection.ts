import type { FillFlowContainer } from 'osucad-framework';
import { ComboColorSelect } from './ComboColorSelect.ts';
import { SetupScreenSection } from './SetupScreenSection.ts';

export class ColorsSection extends SetupScreenSection {
  constructor() {
    super('Colors');
  }

  protected createContent(container: FillFlowContainer): void {
    container.add(new ComboColorSelect());
  }
}
