import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { ComposeScreen, editorScreen } from '@osucad/core';

@editorScreen({
  id: 'viewport',
  name: 'Viewport',
})
export class ViewportScreen extends ComposeScreen {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.composer.leftSidebar.hide();
  }
}
