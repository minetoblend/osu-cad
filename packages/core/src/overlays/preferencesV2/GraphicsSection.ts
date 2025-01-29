import { getIcon } from '@osucad/resources';
import { PreferencesSection } from './PreferencesSection';

export class GraphicsSection extends PreferencesSection {
  constructor() {
    super('Graphics', getIcon('display'));
  }
}
