import type { IScreen } from 'osucad-framework';
import { Axes, dependencyLoader, ScreenStack } from 'osucad-framework';
import { BackgroundScreenStack } from './BackgroundScreenStack.ts';

export class OsucadScreenStack extends ScreenStack {
  private readonly backgroundScreenStack: BackgroundScreenStack;

  constructor(baseScreen?: IScreen, suspendImmediately?: boolean) {
    super(baseScreen, suspendImmediately);

    this.backgroundScreenStack = new BackgroundScreenStack().with({
      relativeSizeAxes: Axes.Both,
    });

    this.internalChild = this.backgroundScreenStack;
  }

  @dependencyLoader()
  load() {
    this.dependencies.provide(BackgroundScreenStack, this.backgroundScreenStack);
  }
}
