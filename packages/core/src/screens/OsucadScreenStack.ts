import type { DependencyContainer, IScreen, ReadonlyDependencyContainer } from '@osucad/framework';
import { Axes, ScreenStack } from '@osucad/framework';
import { BackgroundScreenStack } from './BackgroundScreenStack';

export class OsucadScreenStack extends ScreenStack {
  private readonly backgroundScreenStack: BackgroundScreenStack;

  constructor(baseScreen?: IScreen, suspendImmediately?: boolean) {
    super(baseScreen, suspendImmediately);

    this.backgroundScreenStack = new BackgroundScreenStack().with({
      relativeSizeAxes: Axes.Both,
    });

    this.internalChild = this.backgroundScreenStack;
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#dependencies.provide(BackgroundScreenStack, this.backgroundScreenStack);
  }
}
