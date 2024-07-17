import type { IScreen } from 'osucad-framework';
import { ScreenStack } from 'osucad-framework';
import { OsucadScreen } from './OsucadScreen';

export class OsucadScreenStack extends ScreenStack {
  constructor(baseScreen?: IScreen, suspendImmediately?: boolean) {
    super(baseScreen, suspendImmediately);

    let pushCount = 0;

    this.screenPushed.addListener(({ newScreen }) => {
      if (newScreen instanceof OsucadScreen) {
        const path = newScreen.getPath?.();
        if (path) {
          window.history.pushState(newScreen.name, '', path);
          pushCount++;
        }
      }
    });

    let wasExit = false;

    this.screenExited.addListener(({ newScreen }) => {
      console.log(newScreen);
      if (newScreen instanceof OsucadScreen) {
        const path = newScreen.getPath?.();

        if (path) {
          if (pushCount > 2) {
            wasExit = true;
            window.history.back();
          }
          else {
            window.history.replaceState(null, '', path);
          }

          pushCount--;
        }
      }
    });

    window.addEventListener('popstate', (event) => {
      if (pushCount <= 1) {
        event.preventDefault();
        return;
      }

      if (!wasExit) {
        wasExit = false;

        if (this.currentScreen) {
          this.exit(this.currentScreen);
        }
      }
    });
  }
}
