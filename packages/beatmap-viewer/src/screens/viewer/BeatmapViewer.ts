import type { EditorScreenManager } from '@osucad/common';
import { Editor, VerifyScreen } from '@osucad/common';
import { ViewportScreen } from './screens/viewport/ViewportScreen';

export class BeatmapViewer extends Editor {
  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(ViewportScreen);
    screenManager.register(VerifyScreen);

    screenManager.setCurrentScreen(VerifyScreen);
  }
}
