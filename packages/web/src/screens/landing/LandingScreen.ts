import type { ReadonlyBindable, ReadonlyDependencyContainer } from '@osucad/framework';
import { APIProvider, APIState, ColorProvider, OsucadScreen } from '@osucad/core';
import { Axes, Box, resolved } from '@osucad/framework';
import { HomeScreen } from '../../home/HomeScreen';

export class LandingScreen extends OsucadScreen {
  @resolved(ColorProvider)
  colors!: ColorProvider;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: this.colors.background1,
      }),
    ];
  }

  @resolved(APIProvider)
  api!: APIProvider;

  apiState!: ReadonlyBindable<APIState>;

  protected override loadComplete() {
    super.loadComplete();

    this.apiState = this.api.state.getBoundCopy();
    this.apiState.bindValueChanged((state) => {
      if (state.value === APIState.LoggedIn) {
        if (this.screenStack.currentScreen === this)
          this.screenStack.push(new HomeScreen());
      }
    }, true);
  }
}
